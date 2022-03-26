<script>
    const actions = [
        {
            label: "Sub at Tier 1",
            minutes: 3,
        },
        {
            label: "Sub at Tier 2",
            minutes: 6,
        },
        {
            label: "Sub at Tier 3",
            minutes: 15,
        },
        {
            label: "Gift Sub at Tier 1",
            minutes: 3,
        },
        {
            label: "Gift Sub at Tier 2",
            minutes: 6,
        },
        {
            label: "Gift Sub at Tier 3",
            minutes: 15,
        },
        {
            label: "Donate Bits",
            helpText: "1 minute per 100, rounded up",
        },
        {
            label: "Tip Money",
            helpText: "1 minute per $1, rounded up",
        },
        {
            label: "Patreon Subscription",
        },
        {
            label: "Streamloots card pack purchase",
        },
    ];

    let timeRemaining;
    let updatedTime;
    let timeDelta = null;
    let pendingAdds = [];
    let pendingSubtracts = [];

    $: submitEnabled = pendingAdds.length || pendingSubtracts.length;
    $: timesUp = timeRemaining === "00:00:00";

    function handlePending(e) {
        const action = { ...actions[e.target.parentNode.dataset.index] };
        const type = e.target.dataset.type;
        const input = e.target.parentNode.querySelector("input");
        const minutes = parseInt(input.value, 10);
        const presetMinutes = parseInt(action.minutes, 10);

        action.minutes = minutes;

        if (action.label && action.minutes) {
            if (type === "add") {
                pendingAdds = [...pendingAdds, action];
            } else if (type === "subtract") {
                pendingSubtracts = [...pendingSubtracts, action];
            }
        }

        if (minutes !== presetMinutes) {
            input.value = "";
        }

        timeDelta = null;
    }

    function handleReset() {
        pendingAdds = [];
        pendingSubtracts = [];
        timeRemaining = null;
        timeDelta = null;
        updatedTime = null;

        Array.from(
            document.getElementById("form").querySelectorAll("li.action")
        ).forEach((el) => {
            const action = actions[el.dataset.index];
            el.querySelector("input").value = action.minutes || null;
        });
    }

    const padNumber = (number) => `${number < 10 ? "0" : ""}${number}`;

    function handleSubmit() {
        const addTotal = pendingAdds.reduce(
            (prev, action) => prev + action.minutes,
            0
        );

        const subtractTotal = pendingSubtracts.reduce(
            (prev, action) => prev + action.minutes,
            0
        );

        timeDelta = addTotal - subtractTotal;

        if (timeRemaining) {
            let [hours, minutes, seconds] = timeRemaining
                .split(":")
                .map((segment) => parseInt(segment, 10));

            const totalMinutes = hours * 60 + minutes + timeDelta;

            if (totalMinutes <= 0) {
                timeRemaining = "00:00:00";
                return;
            }

            hours = parseInt(totalMinutes / 60);
            minutes = totalMinutes % 60;
            timeRemaining = `${padNumber(hours)}:${padNumber(minutes)}:00`;

            navigator.permissions
                .query({ name: "clipboard-write" })
                .then((result) => {
                    if (
                        result.state === "granted" ||
                        result.state === "prompt"
                    ) {
                        navigator.clipboard.writeText(timeRemaining).then(
                            () => console.log("Time copied to clipboard"),
                            () => console.log("Error writing to clipboard")
                        );
                    }
                });
        }
    }
</script>

{#if timeDelta !== null}
    <div class="banner{timesUp ? ' times-up' : ''}">
        {#if timesUp}
            Times up!
        {:else if timeDelta < 0}
            Subtracted <b>{0 - timeDelta} minutes</b> from the time remaining
        {:else if timeDelta > 0}
            Added <b>{timeDelta} minutes</b> to the time remaining
        {:else}
            <b>No change</b> (adds and subtracts cancelled out)
        {/if}
        {#if updatedTime}
            Updated time left is <input
                type="text"
                bind:value={updatedTime}
                readonly
            />.
        {/if}
    </div>
{/if}
<div class="calculator">
    <form id="form" on:submit|preventDefault={handleSubmit}>
        <label class="time-remaining">
            <span>Time remaining:</span>
            <input
                type="text"
                bind:value={timeRemaining}
                placeholder="e.g. 01:58:23"
            />
        </label>
        <ul class="actions">
            {#each actions as action, i}
                <li class="action" data-index={i}>
                    <div class="label">
                        {action.label}
                        {#if action.helpText}
                            <div class="help-text">{action.helpText}</div>
                        {/if}
                    </div>
                    {#if action.minutes}
                        <input
                            type="number"
                            readonly
                            value={action.minutes}
                            size="3"
                        />
                    {:else}
                        <input type="number" />
                    {/if}
                    <button
                        data-type="add"
                        type="button"
                        on:click={handlePending}>Add</button
                    >
                    <button
                        data-type="subtract"
                        type="button"
                        on:click={handlePending}>Subtract</button
                    >
                </li>
            {/each}
        </ul>
        <div class="form-controls">
            <button
                class="reset"
                type="button"
                disabled={!submitEnabled}
                on:click={handleReset}>Reset</button
            >
            <button class="submit" type="submit" disabled={!submitEnabled}
                >Submit</button
            >
        </div>
        <div class="pending">
            <div>
                {#if pendingAdds.length}
                    <h2>Adding</h2>
                    <ul class="adds">
                        {#each pendingAdds as action, i}
                            <li class="action-pending" data-index={i}>
                                <a
                                    class="remove-pending"
                                    href={"#"}
                                    on:click={() => {
                                        pendingAdds = pendingAdds.filter(
                                            (_, j) => j !== i
                                        );
                                        timeDelta = null;
                                    }}
                                >
                                    &cross;
                                </a>
                                {action.label} ({action.minutes} mins)
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
            <div>
                {#if pendingSubtracts.length}
                    <h2>Subtracting</h2>
                    <ul class="subtracts">
                        {#each pendingSubtracts as action, i}
                            <li class="action-pending" data-index={i}>
                                <a
                                    class="remove-pending"
                                    href={"#"}
                                    on:click={() => {
                                        pendingSubtracts =
                                            pendingSubtracts.filter(
                                                (_, j) => j !== i
                                            );
                                        timeDelta = null;
                                    }}
                                >
                                    &cross;
                                </a>
                                {action.label} ({action.minutes} mins)
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </div>
    </form>
</div>

<style>
    .banner {
        background: green;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        text-align: center;
        padding: 30px;
    }

    .banner.times-up {
        background-color: red;
    }

    input {
        text-align: center;
        margin-bottom: 0;
        border-radius: 8px;
    }

    input:read-only {
        opacity: 0.6;
        pointer-events: none;
    }

    .time-remaining {
        text-align: center;
    }

    .time-remaining span {
        display: block;
        margin-bottom: 10px;
    }

    .actions {
        list-style: none;
        padding: 0;
        margin: 40px 0;
    }

    .action {
        display: flex;
        align-items: center;
    }

    .action + .action {
        margin-top: 16px;
    }

    .action .label {
        font-weight: bold;
        flex-grow: 1;
    }

    .help-text {
        font-style: italic;
        font-weight: normal;
        font-size: 14px;
    }

    .action input[type="number"]:read-only {
        opacity: 0.6;
        pointer-events: none;
    }

    .action button {
        margin-left: 16px;
        margin-bottom: 0;
    }

    .form-controls {
        text-align: center;
    }

    .form-controls button + button {
        margin-left: 8px;
    }

    .pending {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .pending ul {
        list-style: none;
        padding: 0;
    }

    .remove-pending {
        color: red;
        margin-right: 16px;
        cursor: pointer;
    }

    .remove-pending:hover {
        text-decoration: none;
    }
</style>
