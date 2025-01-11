
const kp_transport = Symbol();
const kp_sender = Symbol();

export class Mailer {

    constructor(transport, sender) {
        this[kp_transport] = transport;
        this[kp_sender] = sender;
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
            const response = await this[kp_transport].sendMail(
                {
                    from: this[kp_sender],
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