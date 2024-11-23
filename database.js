import * as Y from "./yjs.js";
import { WebsocketProvider } from "./y-websocket.js";

document.addEventListener("DOMContentLoaded", () => {
    const threadForm = document.getElementById("new-thread-form");
    const threadTitle = document.getElementById("thread-title");
    const threadContent = document.getElementById("thread-content");
    const threadError = document.getElementById("thread-error");
    const threadsList = document.getElementById("threads-list");
    const sortThreads = document.getElementById("sort-threads");

    // Yjs-dokumentti ja WebSocket-yhteys
    const yDoc = new Y.Doc();
    const provider = new WebsocketProvider("ws://localhost:1234", "threads-room", yDoc);

    // Yjs-muutettavat tietorakenteet
    const threadsMap = yDoc.getMap("threads");
    const commentsMap = yDoc.getMap("comments");

    // Viestien reaaliaikainen kuuntelu
    threadsMap.observe(() => renderThreads());
    commentsMap.observe(() => renderThreads());

    // Uuden viestiketjun luonti
    threadForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = threadTitle.value.trim();
        const content = threadContent.value.trim();

        if (!title && !content) {
            threadError.hidden = false;
            return;
        }

        threadError.hidden = true;

        const threadId = Date.now().toString();
        threadsMap.set(threadId, {
            id: threadId,
            title: title || "Ei otsikkoa",
            content,
            votes: 0,
            createdAt: new Date().toISOString(),
        });

        threadForm.reset();
    });

    // Päivitä viestiketjut
    function renderThreads() {
        threadsList.innerHTML = "";
        const threads = Array.from(threadsMap.values());

        // Lajittele ketjut
        const sortedThreads = threads.sort((a, b) => {
            if (sortThreads.value === "top") {
                return b.votes - a.votes;
            } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Renderöi ketjut
        sortedThreads.forEach((thread) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <h3>${thread.title}</h3>
                <p>${thread.content}</p>
                <div class="vote-buttons">
                    <button data-id="${thread.id}" class="vote-up">+1</button>
                    <span class="vote-count">${thread.votes}</span>
                    <button data-id="${thread.id}" class="vote-down">-1</button>
                </div>
                <div class="comments-section">
                    <h4>Kommentit</h4>
                    <ul id="comments-${thread.id}" class="comments-list"></ul>
                    <form class="comment-form">
                        <input type="text" placeholder="Kirjoita kommentti" required>
                        <button type="submit">Lähetä</button>
                    </form>
                </div>
            `;

            // Lisää kuuntelijat
            li.querySelector(".vote-up").addEventListener("click", () => updateVotes(thread.id, 1));
            li.querySelector(".vote-down").addEventListener("click", () => updateVotes(thread.id, -1));
            li.querySelector(".comment-form").addEventListener("submit", (e) => addComment(e, thread.id));

            renderComments(thread.id); // Renderöi kommentit
            threadsList.appendChild(li);
        });
    }

    // Päivitä äänimäärä
    function updateVotes(threadId, value) {
        const thread = threadsMap.get(threadId);
        if (!thread) return;

        thread.votes += value;
        threadsMap.set(threadId, thread); // Synkronoi Yjs:n kautta
    }

    // Lisää kommentti
    function addComment(event, threadId) {
        event.preventDefault();

        const commentInput = event.target.querySelector("input");
        const commentText = commentInput.value.trim();
        if (!commentText) return;

        const comments = commentsMap.get(threadId) || [];
        comments.push({
            id: Date.now(),
            content: commentText,
            createdAt: new Date().toISOString(),
        });

        commentsMap.set(threadId, comments);
        commentInput.value = ""; // Tyhjennä lomake
    }

    // Päivitä ja näytä kommentit
    function renderComments(threadId) {
        const commentsList = document.getElementById(`comments-${threadId}`);
        const comments = commentsMap.get(threadId) || [];
        commentsList.innerHTML = "";

        comments.forEach((comment) => {
            const li = document.createElement("li");
            li.textContent = comment.content;
            commentsList.appendChild(li);
        });
    }

    // Kuuntelija ketjujen lajitteluun
    sortThreads.addEventListener("change", renderThreads);
});
