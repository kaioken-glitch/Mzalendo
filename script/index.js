const searchDiv = document.querySelector('.searchDiv');

//asynchronous function to toggle the results div and display search results
async function showResults() {
    let resultsDiv = document.querySelector('.resultsDiv');
    //creating the result div and appending it to search div
    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.className = 'resultsDiv';
        searchDiv.appendChild(resultsDiv);
    }

    const input = searchDiv.querySelector('input');
    const query = input.value.trim().toLowerCase();

    //the search results when no input is in the search input 
    if (!query) {
        resultsDiv.innerHTML = `<p style="text-align:center; margin: 0; color: #888;">Nothing to See here!!!</p>`;
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/postData');
        const posts = await response.json();

        // Filters posts by title or content
        const filtered = posts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultsDiv.innerHTML = `<p style="text-align:center; margin: 0; color: #888;">Nothing to See here!!!</p>`;
            return;
        }

        //event listener to the result div results to render their linked posts based on the id they represent
        resultsDiv.querySelectorAll('.resultItem').forEach(item => {
            item.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                renderBlogPost(postId);
                resultsDiv.remove();
            });
        });

        //result div markup stucture 
        resultsDiv.innerHTML = filtered.map(post => `
            <div class="resultItem" data-id="${post.id}">
                <div class="resultItemTitle">${post.title}</div>
                <button class="resultItemButton">
                    <i class="fa-solid fa-book-open"></i>
                    Read
                </button>
            </div>
        `).join('');
    } catch (error) {
        resultsDiv.innerHTML = `<p style="text-align:center; margin: 0; color: #888;">Error loading results</p>`;
        console.error(error);
    }
}

// Hide resultsDiv if clicked or if click is outside searchDiv/resultsDiv
function hideResults(e) {
    const resultsDiv = document.querySelector('.resultsDiv');
    if (!resultsDiv) return;

    // If click is on resultsDiv, remove it
    if (resultsDiv.contains(e.target)) {
        resultsDiv.remove();
        return;
    }
    // If click is outside searchDiv, remove resultsDiv
    if (!searchDiv.contains(e.target)) {
        resultsDiv.remove();
    }
}
document.addEventListener('mousedown', hideResults);
document.querySelector('.searchButton').addEventListener('click', showResults);

//this function sets the active classlist to the addBlog div using the plusHeight icon as a button toggle
function toggleHeight(){
    const blogInputHeight = document.querySelector('.addBlog');
    const plusHeight = document.getElementById('plusHeight');

    plusHeight.addEventListener('click', () => {
        blogInputHeight.classList.toggle('active');
        plusHeight.classList.toggle('active');
    });
}

toggleHeight();

//gets the amount of words in the post content
function getWordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}



//this asynchronous function will take the input values from the form and submits it the db.json via the POST method
async function submitBlogPost(e) {
    e.preventDefault();

    const title = document.getElementById('blogTitle').value.trim();
    const author = document.getElementById('blogAuthor').value.trim();
    const image = document.getElementById('blogImage').value.trim();
    const content = document.getElementById('blogContent').value.trim();

    //alert for when user has empty input values or failed to fill all of the input values 
    if (!title || !author || !content) {
        alert('Please fill in all required fields.');
        return;
    }

    const postData = {
        title,
        author,
        image,
        content,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch('http://localhost:3000/postData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        //this sets the inputs to empty after a post is submitted , basically resetting it
        if (response.ok) {
            alert('Blog post submitted!');
            document.getElementById('blogTitle').value = '';
            document.getElementById('blogAuthor').value = '';
            document.getElementById('blogImage').value = '';
            document.getElementById('blogContent').value = '';
        } else {
            alert('Failed to submit blog post.');
        }
    } catch (error) {
        alert('Error submitting blog post.');
        console.error(error);
    }
}

//this asynchronous function will create a li element that gets appended into postList div , the post title and word count are displayed 
async function renderPosts() {
    const response = await fetch('http://localhost:3000/postData');
    const posts = await response.json();
    const postList = document.querySelector('.postList');
    postList.innerHTML = ''; // Clear existing

    posts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'postMade';
        li.setAttribute('data-id', post.id);
        li.innerHTML = `
            <h3>${post.title}</h3>
            <p>${getWordCount(post.content)} Wrds</p>
        `;
        li.addEventListener('click', function() {
            renderBlogPost(post.id);
        });
        postList.appendChild(li);
    });

    // Update post counter
    document.getElementById('createdCounter').textContent = `${posts.length} Posts`;
}

document.addEventListener('DOMContentLoaded', renderPosts);
document.getElementById('submitBlog').addEventListener('click', submitBlogPost);

let viewTimeout = null;


//this function is to increment the view count after a user spends 2 minutes in the post 
function setupViewCount(post) {
    clearTimeout(viewTimeout);
    viewTimeout = setTimeout(async () => {
        // Increment view count in db
        const newViews = (post.views || 0) + 1;
        await fetch(`http://localhost:3000/postData/${post.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ views: newViews })
        });
        document.getElementById('views').textContent = newViews;
        post.views = newViews; // Update local post object
    }, 120000); // 2 minutes = 120000 ms
}


//this function increments by one the like but also decrements it by onclick , the active classlist is applied onclick when incrementing and removedon reset
function setupLikeButton(post) {
    const likeBtn = document.getElementById('like');
    const likeCount = document.getElementById('likeCount');
    let liked = false;
    likeBtn.classList.remove('active');

    likeBtn.onclick = async function() {
        liked = !liked;
        let newLikes = (post.likes || 0) + (liked ? 1 : -1);
        if (newLikes < 0) newLikes = 0;
        if (liked) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
        await fetch(`http://localhost:3000/postData/${post.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ likes: newLikes })
        });
        likeCount.textContent = newLikes;
        post.likes = newLikes;
    };
}

//this function indicates the date a post was made 
function timeSince(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}

//this will update the time since post was made, edited and updated
function updateTimePassed(post) {
    const timeP = document.getElementById('timePassed');
    function update() {
        timeP.textContent = timeSince(post.updatedAt || post.date || post.createdAt);
    }
    update();
    setInterval(update, 60000); // Update every minute
}



let currentPostId = null;

// Utility: Format date
function formatDate(dateString) {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}.${d.getFullYear()}`;
}

// Renders a blog post in the view
async function renderBlogPost(postId) {
    try {
        const response = await fetch(`http://localhost:3000/postData/${postId}`);
        if (!response.ok) throw new Error('Post not found');
        const post = await response.json();

        document.getElementById('postedBlogTitle').textContent = post.title;
        document.getElementById('postedBlogAuthor').textContent = post.author;
        document.getElementById('blogPostedDate').innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${formatDate(post.date || post.createdAt)}`;
        document.querySelector('.blogPostedImage img').src = post.image || '';
        document.getElementById('blogContentBody').textContent = post.content;
        document.getElementById('views').textContent = post.views || 0;
        document.getElementById('likeCount').textContent = post.likes || 0;
        document.querySelector('.hiddenActionButtons').style.display = 'none';
        document.getElementById('blogContentBody').removeAttribute('contenteditable');
        currentPostId = post.id;

        setupViewCount(post);
        setupLikeButton(post);
        updateTimePassed(post);
    } catch (err) {
        alert('Could not load post.');
    }
}

// Edit button
document.getElementById('editPost').onclick = function() {
    document.getElementById('blogContentBody').setAttribute('contenteditable', 'true');
    document.querySelector('.hiddenActionButtons').style.display = 'flex';
    document.getElementById('blogContentBody').focus();
};

// Save button that initializes the PATCH method and save any edits made the text in blogContentBody
document.getElementById('saveedit').onclick = async function() {
    const updatedContent = document.getElementById('blogContentBody').textContent;
    await fetch(`http://localhost:3000/postData/${currentPostId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent })
    });
    document.getElementById('blogContentBody').removeAttribute('contenteditable');
    document.querySelector('.hiddenActionButtons').style.display = 'none';
    renderBlogPost(currentPostId);
};

// Cancel button will remove the contenteditable attribute applied to the blogBodyContent text
document.getElementById('cancelEdit').onclick = function() {
    document.getElementById('blogContentBody').removeAttribute('contenteditable');
    document.querySelector('.hiddenActionButtons').style.display = 'none';
    renderBlogPost(currentPostId);
};

// Delete button will perform a DELETE method on the post
document.getElementById('deletePost').onclick = async function() {
    if (confirm('Delete this post?')) {
        await fetch(`http://localhost:3000/postData/${currentPostId}`, { method: 'DELETE' });
        document.querySelector('.blogCreatedPost').innerHTML = '<p>Post deleted.</p>';
    }
};

//how first post on page load
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('http://localhost:3000/postData');
    const posts = await response.json();
    if (posts.length > 0) renderBlogPost(posts[0].id);
});