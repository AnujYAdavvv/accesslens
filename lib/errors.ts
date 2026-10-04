// An error whose message is safe to show to users

export class AuditError extends Error {
    constructor (message: string){
        super(message)
        this.name = "AuditError"
    }
}