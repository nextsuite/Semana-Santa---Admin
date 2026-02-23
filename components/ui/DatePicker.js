import { Input } from "./Input";

export function DatePicker({ className, ...props }) {
    return (
        <Input
            type="date"
            className={className}
            {...props}
        />
    );
}
