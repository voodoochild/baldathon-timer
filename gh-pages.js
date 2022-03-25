const ghpages = require('gh-pages');

ghpages.publish(
    'public',
    {
        branch: 'gh-pages',
        repo: 'https://github.com/voodoochild/baldathon-timer.git',
        user: {
            name: 'Kriss Watt',
            email: 'kriss.watt@gmail.com',
        }
    },
    () => console.log('Deployed to Github Pages')
);
