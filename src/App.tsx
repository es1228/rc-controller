import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Button from "./components/Button";
import Slider from "./components/Slider";

const App = () => {
	const [lift, setLift] = useState<number>(0);
	const [speed, setSpeed] = useState<number>(0);
	const [rudder, setRudder] = useState<number>(45);

	const [isConnected, setIsConnected] = useState<boolean>(false);
	const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(
		null,
	);
	const portRef = useRef<SerialPort | null>(null);

	const connectSerial = async () => {
		try {
			if (portRef.current) return;

			portRef.current = await navigator.serial.requestPort();
			await portRef.current.open({ baudRate: 9600 });

			if (portRef.current.writable) {
				writerRef.current = portRef.current.writable.getWriter();
				setIsConnected(true);
			}
		} catch {
			console.error("Connection failed");
		}
	};

	const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

	const sendSerial = async (data: string) => {
		if (!writerRef.current) return;

		const previousWrite = writeQueueRef.current;

		const currentWrite = (async () => {
			try {
				await previousWrite.catch(() => {});

				const oEncoder = new TextEncoder();
				const packet = oEncoder.encode(data + "\n");

				await writerRef.current!.write(packet);
			} catch {
				console.error("Data could not be sent");
			}
		})();
		writeQueueRef.current = currentWrite;
	};

	useEffect(() => {
		isConnected && sendSerial(`U${lift}`);
	}, [lift, isConnected]);

	useEffect(() => {
		isConnected && sendSerial(`V${speed}`);
	}, [speed, isConnected]);

	useEffect(() => {
		isConnected && sendSerial(`R${rudder}`);
	}, [rudder, isConnected]);

	return (
		<>
			<div className="m-4 flex w-fit flex-col gap-4">
				<h1 className="text-3xl">RC Controller</h1>
				<Button
					icon="bluetooth"
					text={isConnected ? "Connected" : "Connect to Bluetooth"}
					onClick={connectSerial}
				/>
			</div>
			<div className="fixed bottom-25 left-5 lg:top-120 lg:bottom-20">
				<div className="bg-on-bg-light dark:bg-on-bg-dark flex w-fit flex-col gap-2 rounded-full">
					<div className="flex items-center gap-15">
						<Button
							icon="arrow_back"
							text=""
							onClick={() => rudder > 0 && setRudder(rudder - 1)}
						/>
						<h1 className="text-center">Rudder</h1>
						<Button
							icon="arrow_forward"
							text=""
							onClick={() => rudder < 90 && setRudder(rudder + 1)}
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
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setLift(e.target.valueAsNumber)
						}
					/>
					<Slider
						text="Speed"
						min={-255}
						max={255}
						value={speed}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setSpeed(e.target.valueAsNumber)
						}
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
