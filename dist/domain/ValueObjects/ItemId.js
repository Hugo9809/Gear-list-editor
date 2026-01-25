export class ItemId {
    constructor(value) {
        this.value = value;
    }
    static create(value) {
        return new ItemId(value);
    }
}
