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
    let addedMinutes = 0;
    let pending = [];

    function addPending(e) {
        const action = { ...actions[e.target.parentNode.dataset.index] };
        const input = e.target.parentNode.querySelector("input");
        const minutes = parseInt(input.value, 10);
        const presetMinutes = parseInt(action.minutes, 10);

        action.minutes = minutes;

        if (action.label && action.minutes) {
            pending = [...pending, action];
        }

        if (minutes !== presetMinutes) {
            input.value = "";
        }

        addedMinutes = null;
    }

    function handleReset() {
        pending = [];
        timeRemaining = null;
        addedMinutes = null;
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
        addedMinutes = pending.reduce(
            (prev, action) => prev + action.minutes,
            0
        );

        if (timeRemaining) {
            let [hours, minutes, seconds] = timeRemaining
                .split(":")
                .map((segment) => parseInt(segment, 10));

            const totalMinutes = hours * 60 + minutes + addedMinutes;
            hours = parseInt(totalMinutes / 60);
            minutes = totalMinutes % 60;
            timeRemaining = `${padNumber(hours)}:${padNumber(
                minutes
            )}:${padNumber(seconds)}`;

            navigator.permissions
                .query({ name: "clipboard-write" })
                .then((result) => {
                    if (
                        result.state === "granted" ||
                        result.state === "prompt"
                    ) {
                        navigator.clipboard.writeText(timeRemaining).then(
                            () => alert("Updated time copied to clipboard"),
                            () => console.log("Error writing to clipboard")
                        );
                    }
                });
        }
    }
</script>

{#if addedMinutes}
    <div class="banner">
        Added <b>{addedMinutes} minutes</b>!
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
                    <button type="button" on:click={addPending}>Add</button>
                    <!-- <button type="button" disabled>Subtract</button> -->
                </li>
            {/each}
        </ul>
        <div class="form-controls">
            <button
                class="reset"
                type="button"
                disabled={pending.length === 0}
                on:click={handleReset}>Reset</button
            >
            <button class="submit" type="submit" disabled={pending.length === 0}
                >Submit</button
            >
        </div>
        <ul class="pending">
            {#each pending as action, i}
                <li class="action-pending" data-index={i}>
                    <a
                        class="remove-pending"
                        href={"#"}
                        on:click={() => {
                            pending = pending.filter((_, j) => j !== i);
                            addedMinutes = null;
                        }}
                    >
                        &cross;
                    </a>
                    {action.label} ({action.minutes} mins)
                </li>
            {/each}
        </ul>
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
