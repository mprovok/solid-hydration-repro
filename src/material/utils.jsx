import { createMemo } from "solid-js";
import { createScheduled, debounce } from "@solid-primitives/scheduled";

const createDebouncedMemo = (fn, timeoutMs, value, options) => {
	const scheduled = createScheduled((f) => debounce(f, timeoutMs));
	return createMemo((prev = value) => scheduled() || prev === void 0 ? fn(value) : prev, options);
};
export { createDebouncedMemo };

