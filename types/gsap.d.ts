declare module 'gsap/SplitText' {
    export class SplitText {
        constructor(target: any, vars?: any);
        lines: HTMLElement[];
        words: HTMLElement[];
        chars: HTMLElement[];
        revert(): void;
    }
}
