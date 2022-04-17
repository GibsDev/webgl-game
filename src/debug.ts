export default class Debug {

    dom: HTMLDivElement;
    private code: HTMLElement;
    private name?: string;

    constructor(name?: string) {
        this.name = name;
        
        const div = document.createElement('div');
        const code = document.createElement('code');
        
        div.style.position = 'fixed';
        div.style.zIndex = '999';
        div.style.color = '#fff';
        div.style.backgroundColor = '#ffffff0c';
        div.style.padding = '0.5em';
        
        div.appendChild(code);

        this.dom = div;
        this.code = code;
    }

    update(value: string) {
        if (this.name) {
            this.code.innerText = `${this.name}\n${value}`;
        } else {
            this.code.innerText = `${value}`;
        }
    }
}
