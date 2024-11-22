// comments_module.js
// Module to handle comments functionality

let db; // Add a reference to IndexedDB to use across functions

// Handle Adding Comment
function handleAddComment(threadId, threadElement) {
    const newCommentInput = threadElement.querySelector(".new-comment");
    const commentText = newCommentInput.value.trim();
    if (commentText) {
        const sanitizedComment = sanitizeHTML(commentText);
        storeCommentInDB({ threadId, content: sanitizedComment, votes: 0 }, (id) => {
            addCommentToThreadElement({ threadId, content: sanitizedComment, votes: 0, id }, threadElement.querySelector(".comment-list"));
            newCommentInput.value = "";
        });
    }
}

// Store Comment in IndexedDB
function storeCommentInDB(comment, callback) {
    const transaction = db.transaction("comments", "readwrite");
    transaction.oncomplete = () => callback && callback();
    transaction.onerror = (event) => console.error("Transaction failed: ", event.target.errorCode);
    const store = transaction.objectStore("comments");
    store.add(comment).onsuccess = (event) => callback && callback(event.target.result);
}

// Add Comment to Thread Element
function addCommentToThreadElement(comment, commentListElement) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");
    commentDiv.setAttribute("data-id", comment.id);
    commentDiv.innerHTML = `
        <p>${sanitizeHTML(comment.content)}</p>
        <button class="vote-up-comment">+1</button>
        <button class="vote-down-comment">-1</button>
        <span class="score">Score: ${comment.votes}</span>
    `;
    attachCommentVoteHandlers(commentDiv);
    commentListElement.appendChild(commentDiv);
}

// Attach Event Handlers for Comment Voting
function attachCommentVoteHandlers(comment) {
    const commentId = parseInt(comment.getAttribute("data-id"));
    comment.querySelectorAll(".vote-up-comment, .vote-down-comment").forEach(btn => {
        btn.addEventListener("click", () => handleCommentVote(commentId, btn.classList.contains("vote-up-comment") ? 1 : -1, comment));
    });
}

// Handle Comment Voting
function handleCommentVote(commentId, voteChange, commentElement) {
    updateCommentVotes(commentId, voteChange, commentElement.querySelector(".score"));
}

// Update Comment Votes in IndexedDB
function updateCommentVotes(commentId, voteChange, scoreSpan) {
    const transaction = db.transaction("comments", "readwrite");
    const store = transaction.objectStore("comments");
    store.get(commentId).onsuccess = (event) => {
        const comment = event.target.result;
        if (comment) {
            comment.votes += voteChange;
            store.put(comment);
            scoreSpan.textContent = `Score: ${comment.votes}`;
        }
    };
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(html) {
    const tempDiv = document.createElement("div");
    tempDiv.textContent = html;
    return tempDiv.innerHTML;
}

// Set the IndexedDB reference
export function setDatabase(database) {
    db = database;
}

export { handleAddComment, storeCommentInDB, addCommentToThreadElement, attachCommentVoteHandlers, sanitizeHTML };
