class Person {
    constructor(name) {
        this.total = 0;
        this.transactions = [];
        this.name = name;
    }

    displayTransactions() {
        console.log("Transactions for: " + this.name);
        console.log("Date, From, To, Narrative, Amount");
        this.transactions.forEach(item => {
            console.log(item.returnString());
        });
    }

    displayTotal() {
        console.log(this.name + ": " + (this.total).toFixed(2));
    }

    addTransaction(data) {
        this.transactions.push(data);
        if (this.name === data.from) {

            this.total -= parseFloat(data.amount);
        }
        if (this.name === data.to) {

            this.total += parseFloat(data.amount);
        }
    }
}
exports.Person = Person;