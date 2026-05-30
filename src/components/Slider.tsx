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
					list={`${text.replaceAll(" ", "")}-tickmarks`}
					className="bg-on-bg-light accent-primary dark:bg-on-bg-dark h-full appearance-auto rounded-full p-2 [direction:rtl] [writing-mode:vertical-lr]"
				/>
				<datalist
					id={`${text.replaceAll(" ", "")}-tickmarks`}
					className="flex flex-col-reverse justify-between text-sm select-none"
				>
					<option value={min} label={`${min}`}></option>
					<option
						value={(min + max) / 2}
						label={`${(min + max) / 2}`}
					></option>
					<option value={max} label={`${max}`}></option>
				</datalist>
			</div>
			<h1 className="select-none">{text}</h1>
		</div>
	);
};
export default Slider;
