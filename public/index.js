const input = document.querySelector('#url-input');
const submitBtn = document.querySelector('#submit');
const originalURL = document.querySelector('#original-url');
const shortURL = document.querySelector('#short-url');

submitBtn.addEventListener('click', () => {
    fetch(`/new/${input.value}`)
        .then(resp => resp.json())
        .then(function(data) {
            originalURL.textContent = data.originalURL;
            originalURL.setAttribute('href', data.originalURL);
            shortURL.textContent = window.location.href + data.shortURL;
            shortURL.setAttribute('href', window.location.href + data.shortURL);
        })
        .catch(function(error) {
            console.log(error);
        });
});