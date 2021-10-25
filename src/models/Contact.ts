export class Contact {
    constructor(
        public nickname?: string,
        public messages?: [],
        public unseen_messages: number = 0
    ){}

}