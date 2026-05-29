type ButtonProps = {
	icon: string;
	text: string;
	onClick: () => void;
};

const Button = ({ icon, text, onClick }: ButtonProps) => {
	return (
		<div className="group hover:bg-primary bg-on-bg-light dark:bg-on-bg-dark flex items-center justify-center gap-2 rounded-full p-4 hover:cursor-pointer select-none" onClick={onClick}>
			<span className="icon icon-rounded group-hover:icon-700 group-hover:cursor-pointer group-hover:transition-all">
				{icon}
			</span>
			<p>{text}</p>
		</div>
	);
};
export default Button;
