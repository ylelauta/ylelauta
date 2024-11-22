// threads_module.js
// Module to handle thread functionality

let db; // Add a reference to IndexedDB to use across functions

// Create Thread Element
function createThreadElement(thread) {
    const threadDiv = document.createElement("div");
    threadDiv.classList.add("thread");
    threadDiv.setAttribute("data-id", thread.id);
    threadDiv.innerHTML = `
        <h3>${sanitizeHTML(thread.title)}</h3>
        <p>${sanitizeHTML(thread.content)}</p>
        <button class="vote-up">+1</button>
        <button class="vote-down">-1</button>
        <span class="score">Score: ${thread.votes}</span>
        <div class="comments">
            <input type="text" class="new-comment" placeholder="Add a comment">
            <button class="add-comment">Comment</button>
            <div class="comment-list"></div>
        </div>
    `;
    attachCommentEventHandlers(threadDiv);
    return threadDiv;
}

// Attach Event Handlers for Adding Comment
function attachCommentEventHandlers(thread) {
    const threadId = parseInt(thread.getAttribute("data-id"));
    thread.querySelector(".add-comment").addEventListener("click", () => handleAddComment(threadId, thread));
}

// Set the IndexedDB reference
export function setDatabase(database) {
    db = database;
}

export { createThreadElement, attachCommentEventHandlers };
