import type { ChangeEvent, MouseEvent, TouchEvent } from "react";

type SliderProps = {
	text: string;
	min: number;
	max: number;
	value: number;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onMouseUp: (e: MouseEvent<HTMLInputElement>) => void;
	onTouchEnd: (e: TouchEvent<HTMLInputElement>) => void;
};

declare module "react" {
	interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
		orient?: string;
	}
}

const Slider = ({
	text,
	min,
	max,
	value,
	onChange,
	onMouseUp,
	onTouchEnd,
}: SliderProps) => {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex h-full gap-2">
				<input
					type="range"
					orient="vertical"
					min={min}
					max={max}
					value={value}
					onChange={onChange}
					onMouseUp={onMouseUp}
					onTouchEnd={onTouchEnd}
					className="bg-on-bg-light accent-blue dark:bg-on-bg-dark h-full appearance-auto rounded-full p-2 [direction:rtl] [writing-mode:vertical-lr]"
				/>
				<div
					className="flex flex-col-reverse justify-between text-sm select-none pointer-events-none"
				>
					<span className="select-none pointer-events-none">{min}</span>
					<span className="select-none pointer-events-none">{(max + min)/2 == 0 ? (min + max)/2 : ""}</span>
					<span className="select-none pointer-events-none">{max}</span>
				</div>
			</div>
			<h1 className="select-none">{text}</h1>
		</div>
	);
};
export default Slider;
