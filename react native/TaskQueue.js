'use strict';

class TaskQueue {
    constructor() {
        this.tasks = [];
    }

    add = (task) => {
        this.tasks.push(task);
        if (this.tasks.length === 1) {
            this._executeNextTask();
        }
    }

    _executeNextTask = () => {
        let currentTask = this.tasks[0];
        currentTask()
            .catch(error => console.warn(error.message))
            .then(() => {
                this.tasks.shift();
                if (this.tasks.length !== 0) {
                    this._executeNextTask();
                }
            });
    }
}

export default new TaskQueue();