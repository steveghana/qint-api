class TestWs {
    history: string[] = [];

    publish(eventIdentifier: string): void {
        this.history.push(eventIdentifier);
    }

    getHistory(): string[] {
        return this.history;
    }

    init(): void {}
}

function init(): TestWs {
    return new TestWs();
}

export default init;
