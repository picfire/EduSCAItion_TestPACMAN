document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-menu');
    const menu = document.getElementById('menu');

    toggleButton.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Example featured projects
    const projects = [
        {
            title: "Chase Game",
            image: "https://cdn2.scratch.mit.edu/get_image/project/10128407_480x360.png",
            author: "ScratchUser1"
        },
        {
            title: "Virtual Pet",
            image: "https://cdn2.scratch.mit.edu/get_image/project/10128507_480x360.png",
            author: "ScratchUser2"
        },
        {
            title: "Maze Runner",
            image: "https://cdn2.scratch.mit.edu/get_image/project/10128607_480x360.png",
            author: "ScratchUser3"
        }
    ];

    const projectGrid = document.getElementById('projectGrid');
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <img src="${project.image}" alt="${project.title}">
            <h4>${project.title}</h4>
            <p>by ${project.author}</p>
        `;
        projectGrid.appendChild(card);
    });

    document.getElementById('start-btn').addEventListener('click', () => {
        alert('Let\'s start creating! (This is a demo button.)');
    });
});