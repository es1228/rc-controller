import type { ChangeEvent } from "react";

type SliderProps = {
	text: string;
    min: number;
    max: number;
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

declare module "react" {
	interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
		orient?: string;
	}
}

const Slider = ({ text, min, max, value, onChange }: SliderProps) => {
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
					list="tickmarks"
					className="bg-on-bg-light accent-primary dark:bg-on-bg-dark rounded-full p-2 [writing-mode:vertical-lr] [direction:rtl] appearance-auto"
				/>
				<datalist
					id="tickmarks"
					className="flex flex-col-reverse justify-between text-sm"
				>
					<option value={min} label={`${min}`}></option>
					<option value={(min + max)/2} label={`${(min + max)/2}`}></option>
					<option value={max} label={`${max}`}></option>
				</datalist>
			</div>
			<h1>{text}</h1>
		</div>
	);
};
export default Slider;
