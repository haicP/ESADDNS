export default class {
    private readonly _title: string
    private readonly _isDebug: number

    private getTimeString(): string {
        return new Date().toISOString().replace("T", " ")
    }

    /**
     * 创建一个日志对象
     * @param title 日志头
     * @param isDebug 是否输出调试日志
     */
    constructor(title: string, isDebug: boolean = false) {
        this._title = title
        this._isDebug = isDebug
    }

    /**
     * 输出日志
     * @param leave 日志等级
     * @param message
     */
    public log(leave: number, message: any[]) {
        if (leave == 1 && this._isDebug) {
            console.log(
                `${this.getTimeString()} %cDEBUG%c [${this._title}]`,
                "color: #888888",
                "",
                ...message,
            )
        } else if (leave == 2) {
            console.log(
                `${this.getTimeString()} %cINFO%c [${this._title}]`,
                "color: #00FF00",
                "",
                ...message,
            )
        } else if (leave == 3) {
            console.log(
                `${this.getTimeString()} %cWARN%c [${this._title}]`,
                "color: #FFA500",
                "",
                ...message,
            )
        } else if (leave == 4) {
            console.log(
                `${this.getTimeString()} %cERROR%c [${this._title}]`,
                "color: #FF0000",
                "",
                ...message,
            )
        } else if (leave == 5) {
            console.log(
                `${this.getTimeString()} %cFATAL%c [${this._title}]`,
                "color: #FFFFFF; background-color: #FF0000",
                "",
                ...message,
            )
            // 抛出异常，终止进程
            Deno.exit(1)
        } else {
            // 普通日志不加颜色
            console.log(
                `${this.getTimeString()} [${this._title}]`,
                ...message,
            )
        }
    }

    /**
     * 输出调试日志
     * @param message 日志内容
     */
    public debug(...message: any[]) {
        this.log(1, message)
    }

    /**
     * 输出信息日志
     * @param message 日志内容
     */
    public info(...message: any[]) {
        this.log(2, message)
    }

    /**
     * 输出警告日志
     * @param message 日志内容
     */
    public warn(...message: any[]) {
        this.log(3, message)
    }

    /**
     * 输出错误日志
     * @param message 日志内容
     */
    public error(...message: any[]) {
        this.log(4, message)
    }

    /**
     * 输出致命错误日志
     * @param message 日志内容
     */
    public fatal(...message: any[]) {
        this.log(5, message)
    }
}
