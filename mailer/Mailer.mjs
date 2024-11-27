
export class Mailer {
    #transport;
    #sender;

    constructor(transport, sender) {
        this.#transport = transport;
        this.#sender = sender;
    }

    async sendMessage(msg) {
        // send some mail
        try {
            const text = `User email : ${msg.email}
Nature of message: ${msg.type}
Gcode bucket filename: ${msg.bucketname}

${msg.message}`;
            return this.sendMail("glennerichall@hotmail.com, zupfe@velor.ca", msg.subject, text);
        } catch (e) {
            return false;
        }
    }

    async sendMail(to, subject, text) {
        // send some mail
        try {
            const response = await this.#transport.sendMail(
                {
                    from: this.#sender,
                    to,
                    subject,
                    text
                }
            );
            return true;
        } catch (e) {
            return false;
        }
    }
}