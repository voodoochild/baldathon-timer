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

<main>
    <form id="form" on:submit|preventDefault={handleSubmit}>
        <label>
            Time remaining:
            <input
                type="text"
                bind:value={timeRemaining}
                placeholder="e.g. 01:58:23"
            />
        </label>
        <ul class="actions">
            {#each actions as action, i}
                <li class="action" data-index={i}>
                    <button type="button" on:click={addPending}>
                        {action.label}
                    </button>
                    {#if action.minutes}
                        <input type="number" readonly value={action.minutes} />
                    {:else}
                        <input type="number" />
                    {/if}
                    {#if action.helpText}
                        <span class="help-text">{action.helpText}</span>
                    {/if}
                </li>
            {/each}
        </ul>
        <ul id="pending">
            {#each pending as action, i}
                <li class="action-pending" data-index={i}>
                    {action.label} ({action.minutes} mins)
                    <button
                        type="button"
                        on:click={() => {
                            pending = pending.filter((_, j) => j !== i);
                            addedMinutes = null;
                        }}
                    >
                        🗑️
                    </button>
                </li>
            {/each}
        </ul>
        <button
            type="button"
            disabled={pending.length === 0}
            on:click={handleReset}>Reset</button
        >
        <button type="submit" disabled={pending.length === 0}>Submit</button>
        {#if addedMinutes}
            <div>
                Adding <b>{addedMinutes} minutes</b> to the clock.
                {#if updatedTime}
                    Updated time left is <input
                        type="text"
                        bind:value={updatedTime}
                        readonly
                    />.
                {/if}
            </div>
        {/if}
    </form>
</main>

<style></style>
