import {
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
	type MouseEvent,
	type TouchEvent,
} from "react";
import Button from "./components/Button";
import Slider from "./components/Slider";

const App = () => {
	// control variables
	const [lift, setLift] = useState<number>(0);
	const [speed, setSpeed] = useState<number>(0);
	const [rudder, setRudder] = useState<number>(45);

	// serial port variables
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(
		null,
	);
	const portRef = useRef<SerialPort | null>(null);

	// slider control variables
	const liftToggledRef = useRef<boolean>(false);
	const speedToggledRef = useRef<boolean>(false);
	const serialDelay = 50;

	// connect to serial port
	const connectSerial = async () => {
		try {
			if (isConnected) return;
			await disconnectSerial();

			portRef.current = await navigator.serial.requestPort();
			await portRef.current.open({ baudRate: 9600 });

			if (portRef.current.writable) {
				writerRef.current = portRef.current.writable.getWriter();
				setIsConnected(true);
			}
		} catch (err) {
			console.error(err);
			setIsConnected(false);
		}
	};

	// create a queue of promises to handle lots of data
	const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

	// send data over serial port
	const sendSerial = async (data: string) => {
		if (!isConnected || !writerRef.current) return;

		const previousWrite = writeQueueRef.current;

		const currentWrite = (async () => {
			try {
				await previousWrite.catch(() => {});

				if (!isConnected || !writerRef.current) return;

				const oEncoder = new TextEncoder();
				const packet = oEncoder.encode(data + "\n");

				await writerRef.current!.write(packet);
			} catch (err) {
				console.error(err);
			}
		})();
		writeQueueRef.current = currentWrite;
	};

	// disconnect serial port
	const disconnectSerial = async () => {
		setIsConnected(false);
		writerRef.current?.releaseLock();
		await portRef.current?.close().catch(() => {});
		portRef.current = null;
		writerRef.current = null;
	};

	// lift slider change
	const handleLiftChange = (e: ChangeEvent<HTMLInputElement>) => {
		const val = e.target.valueAsNumber;
		setLift(val);

		if (!liftToggledRef.current && isConnected) {
			sendSerial(`U${val}`);
			liftToggledRef.current = true;
			setTimeout(() => {
				liftToggledRef.current = false;
			}, serialDelay);
		}
	};

	// speed slider change
	const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
		const val = e.target.valueAsNumber;
		setSpeed(val);

		if (!speedToggledRef.current && isConnected) {
			sendSerial(`V${val}`);
			speedToggledRef.current = true;
			setTimeout(() => {
				speedToggledRef.current = false;
			}, serialDelay);
		}
	};

	// sync the final values when sliders let go
	const syncFinalLift = (
		e: MouseEvent<HTMLInputElement> | TouchEvent<HTMLInputElement>,
	) => isConnected && sendSerial(`U${e.currentTarget.valueAsNumber}`);
	const syncFinalSpeed = (
		e: MouseEvent<HTMLInputElement> | TouchEvent<HTMLInputElement>,
	) => isConnected && sendSerial(`V${e.currentTarget.valueAsNumber}`);

	// check for rudder changes
	useEffect(() => {
		isConnected && sendSerial(`R${rudder}`);
	}, [rudder, isConnected]);

	// check for port disconnect
	useEffect(() => {
		const handleDisconnect = (event: Event) => {
			const disconnectedPort = event.target as SerialPort;

			if (disconnectedPort === portRef.current) {
				console.warn("Serial port disconnected");
				disconnectSerial();
			}
		};
		navigator.serial.addEventListener("disconnect", handleDisconnect);

		return () => {
			navigator.serial.removeEventListener(
				"disconnect",
				handleDisconnect,
			);
		};
	}, []);

	// send a heartbeat every 500ms
	useEffect(() => {
		if (!isConnected) return;

		const heartbeatInterval = setInterval(() => {
			isConnected && writerRef.current && sendSerial("H");
		}, 500);

		return () => clearInterval(heartbeatInterval);
	}, [isConnected]);

	return (
		<>
			<div className="m-4 flex w-fit flex-col gap-4">
				<div className="flex items-center gap-4 select-none">
					<h1 className="text-2xl">RC Controller</h1>
					<Button
						icon="fullscreen"
						text="Toggle"
						onClick={() => {
							!document.fullscreenElement
								? document.documentElement
										.requestFullscreen()
										.catch(
											() => "Unable to enter fullscreen",
										)
								: document.exitFullscreen();
						}}
					/>
				</div>
				<Button
					icon="bluetooth"
					text={isConnected ? "Disconnect" : "Connect"}
					onClick={isConnected ? disconnectSerial : connectSerial}
				/>
			</div>
			<div className="fixed bottom-25 left-5 lg:top-120 lg:bottom-20">
				<div className="bg-on-bg-light dark:bg-on-bg-dark flex w-fit flex-col gap-2 rounded-full">
					<div className="flex items-center gap-10">
						<Button
							icon="arrow_back"
							text=""
							onClick={() => rudder > 0 && setRudder(rudder - 15)}
						/>
						<h1 className="text-center select-none">
							{rudder == 45
								? "CEN"
								: rudder < 45
									? `${45 - rudder}° L`
									: `${rudder - 45}° R`}
						</h1>
						<Button
							icon="arrow_forward"
							text=""
							onClick={() =>
								rudder < 90 && setRudder(rudder + 15)
							}
						/>
					</div>
				</div>
			</div>
			<div className="fixed top-10 right-10 bottom-10 lg:top-25 lg:bottom-25">
				<div className="flex h-full gap-20">
					<Slider
						text="Lift Fan"
						min={0}
						max={255}
						value={lift}
						onChange={handleLiftChange}
						onMouseUp={syncFinalLift}
						onTouchEnd={syncFinalLift}
					/>
					<Slider
						text="Speed"
						min={-255}
						max={255}
						value={speed}
						onChange={handleSpeedChange}
						onMouseUp={syncFinalSpeed}
						onTouchEnd={syncFinalSpeed}
					/>
				</div>
			</div>
			<div className="fixed bottom-5 left-5">
				<div className="flex gap-4">
					<Button
						icon="speed_2"
						text="Brake"
						onClick={() => sendSerial("S")}
					/>
					<Button
						icon="power_off"
						text="Power Off"
						onClick={() => sendSerial("X")}
					/>
				</div>
			</div>
		</>
	);
};

export default App;
