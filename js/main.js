// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

// Language toggle functionality
function toggleLanguage() {
    const body = document.body;
    const languageText = document.getElementById('language-text');
    const currentLanguage = body.getAttribute('data-lang') || 'es';
    
    if (currentLanguage === 'es') {
        body.setAttribute('data-lang', 'en');
        languageText.textContent = 'ES';
        translatePage('en');
        localStorage.setItem('language', 'en');
    } else {
        body.setAttribute('data-lang', 'es');
        languageText.textContent = 'EN';
        translatePage('es');
        localStorage.setItem('language', 'es');
    }
}

// Translation function
function translatePage(language) {
    const elements = document.querySelectorAll('[data-es][data-en]');
    elements.forEach(element => {
        if (language === 'en') {
            element.textContent = element.getAttribute('data-en');
        } else {
            element.textContent = element.getAttribute('data-es');
        }
    });
    
    // Update PDF button aria-label
    const pdfButton = document.getElementById('pdf-button');
    if (pdfButton) {
        pdfButton.setAttribute('aria-label', language === 'en' ? 'Download CV in PDF' : 'Descargar CV en PDF');
    }
}

// PDF Generation function
function downloadPDF() {
    // Guard: ensure jsPDF is loaded (UMD exposes window.jspdf.jsPDF)
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('jsPDF no está cargado. Verifica la conexión a la CDN o que el script esté presente.');
        console.error('jsPDF no encontrado en window.jspdf:', window.jspdf);
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const currentLanguage = document.body.getAttribute('data-lang') || 'es';
    
    // Set font
    doc.setFont('helvetica');
    
    // Colors
    const primaryColor = '#2563eb';
    const textColor = '#0f172a';
    const secondaryColor = '#64748b';
    
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to add text with word wrap
    function addText(text, x, y, options = {}) {
        const {
            fontSize = 12,
            color = textColor,
            fontStyle = 'normal',
            maxWidth = contentWidth
        } = options;
        
        doc.setFontSize(fontSize);
        doc.setTextColor(color);
        doc.setFont('helvetica', fontStyle);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
    }
    
    // Helper function to add section header
    function addSectionHeader(title, y) {
        doc.setFillColor(primaryColor);
        doc.rect(margin, y - 5, contentWidth, 8, 'F');
        
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, y + 2);
        
        return y + 15;
    }
    
    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('José Miguel Amaya Camacho', margin, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Full Stack Engineer', margin, 30);
    
    yPosition = 50;
    
    // Contact Information
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Contact Information' : 'Información de Contacto', yPosition);
    
    const contactInfo = currentLanguage === 'en' ? [
        'Email: miguel.amaya99@gmail.com',
        'GitHub: github.com/joseamaya',
        'Location: Piura, Peru',
        'Website: Python Piura'
    ] : [
        'Email: miguel.amaya99@gmail.com',
        'GitHub: github.com/joseamaya',
        'Ubicación: Piura, Perú',
        'Sitio Web: Python Piura'
    ];
    
    contactInfo.forEach(info => {
        yPosition = addText(info, margin, yPosition, { fontSize: 10, color: secondaryColor });
    });
    
    yPosition += 10;
    
    // About Me
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'About Me' : 'Acerca de mí', yPosition);
    
    const aboutText = currentLanguage === 'en' ? 
        'Full Stack Engineer, specialist in Python and JavaScript. Computer Engineer graduated from the National University of Piura. Co-founder of Tallanix S.A.C and Xprende Tech. Free Software activist and founding member of the Piura Free Software Community VICUX and the Python Piura Programmers Community.' :
        'Full Stack Engineer, especialista en Python y JavaScript. Ingeniero Informático egresado de la Universidad Nacional de Piura. Socio fundador de Tallanix S.A.C y de Xprende Tech. Activista del Software Libre y miembro fundador de la Comunidad Piurana de Software Libre VICUX y de la Comunidad de Programadores Python Piura.';
    
    yPosition = addText(aboutText, margin, yPosition, { fontSize: 10 });
    yPosition += 10;
    
    // Skills
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Skills' : 'Habilidades', yPosition);
    
    const skills = [
        'Python (90%)', 'JavaScript (90%)', 'GNU/Linux (90%)', 'Git (90%)',
        'Django (90%)', 'React (70%)', 'Vue (70%)'
    ];
    
    const skillsText = skills.join(' • ');
    yPosition = addText(skillsText, margin, yPosition, { fontSize: 10 });
    yPosition += 10;
    
    // Languages
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Languages' : 'Idiomas', yPosition);
    
    const languages = currentLanguage === 'en' ? 
        'Spanish (100%) • English (65%)' : 
        'Español (100%) • Inglés (65%)';
    
    yPosition = addText(languages, margin, yPosition, { fontSize: 10 });
    yPosition += 15;
    
    // Work Experience
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Work Experience' : 'Experiencia Laboral', yPosition);
    
    const experiences = currentLanguage === 'en' ? [
        {
            title: 'CTO - Co-founder',
            company: 'Xprende Tech, Quito',
            period: 'Jun 2019 - Present',
            description: 'I am responsible for leading the technology team and supervising all decisions related to technology and product development of the company. I am also a co-founder of the company with projects in several Latin American countries.'
        },
        {
            title: 'Full Stack Engineer',
            company: 'Efilm Online, Bilbao',
            period: 'Feb 2017 - Present',
            description: 'I am responsible for working on all parts of the software development process, from user interface design to backend creation and system architecture, as well as application implementation and problem solving.'
        },
        {
            title: 'Co-founder',
            company: 'Tallanix S.A.C',
            period: 'Dec 2016 - Present',
            description: 'Tallanix is a company that we have formed together with other partners to carry out incubation and acceleration activities for startups in the North zone of Peru and South of Ecuador.'
        }
    ] : [
        {
            title: 'CTO - Socio Fundador',
            company: 'Xprende Tech, Quito',
            period: 'Jun 2019 - Actualidad',
            description: 'Soy el responsable de liderar el equipo de tecnología y supervisar todas las decisiones relacionadas con la tecnología y el desarrollo de productos de la empresa. Soy además socio fundador de la empresa con proyectos en varios países de Latinoamérica.'
        },
        {
            title: 'Full Stack Engineer',
            company: 'Efilm Online, Bilbao',
            period: 'Feb 2017 - Actualidad',
            description: 'Soy responsable de trabajar en todas las partes del proceso de desarrollo de software, desde el diseño de la interfaz de usuario hasta la creación del backend y la arquitectura del sistema además de la implementación de las aplicaciones y la resolución de problemas.'
        },
        {
            title: 'Socio Fundador',
            company: 'Tallanix S.A.C',
            period: 'Dic 2016 - Actualidad',
            description: 'Tallanix es una empresa que hemos formado en conjunto con otros socios para llevar acabo actividades de incubación y aceleración de emprendimientos en la zona Norte de Perú y Sur del Ecuador.'
        }
    ];
    
    experiences.forEach(exp => {
        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        // Job title and company
        yPosition = addText(exp.title, margin, yPosition, { fontSize: 11, fontStyle: 'bold' });
        yPosition = addText(exp.company, margin, yPosition, { fontSize: 10, color: primaryColor });
        yPosition = addText(exp.period, margin, yPosition, { fontSize: 9, color: secondaryColor });
        
        // Description
        yPosition = addText(exp.description, margin, yPosition, { fontSize: 9 });
        yPosition += 8;
    });
    
    // Education
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Education' : 'Educación', yPosition);
    
    const education = currentLanguage === 'en' ? [
        'Computer Engineering - National University of Piura (2004-2009)',
        'Secondary Education - I.E San Pedro - Cancas (1999-2003)',
        'Primary Education - I.E José Olaya Balandra (1993-1998)'
    ] : [
        'Ingeniería Informática - Universidad Nacional de Piura (2004-2009)',
        'Educación Secundaria - I.E San Pedro - Cancas (1999-2003)',
        'Educación Primaria - I.E José Olaya Balandra (1993-1998)'
    ];
    
    education.forEach(edu => {
        yPosition = addText(edu, margin, yPosition, { fontSize: 10 });
    });
    
    yPosition += 10;
    
    // Personal Projects
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Personal Projects' : 'Proyectos Personales', yPosition);
    
    const projects = currentLanguage === 'en' ? [
        {
            name: 'Tambox',
            description: 'Free software developed in Django with PostgreSQL database for the management and control of a company\'s logistics, currently supports the creation of purchase orders, service orders, requirements management, warehouse management and generation of accounting reports specific to the warehouse.'
        },
        {
            name: 'Volpox',
            description: 'Free software developed in Django for controlling votes cast and recorded in electoral records for regional and national election processes in Peru, it was successfully tested in the regional and local election process in 2014 and in the national elections of 2016.'
        }
    ] : [
        {
            name: 'Tambox',
            description: 'Software libre desarrollado en Django con la base de datos PostgreSQL para la gestión y control de la logística de una empresa, actualmente soporta la creación de órdenes de compra, órdenes de servicio, gestión de requerimientos, gestión de almacenes y generación de reportes contables propios del almacén.'
        },
        {
            name: 'Volpox',
            description: 'Software libre desarrollado en Django para el control de los votos emitidos y registrados en las actas electorales para los procesos de elecciones regionales y nacionales en Perú, fue probado exitosamente en el proceso de elecciones regionales y locales en el año 2014 y en las elecciones nacionales del año 2016.'
        }
    ];
    
    projects.forEach(project => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = addText(project.name, margin, yPosition, { fontSize: 11, fontStyle: 'bold' });
        yPosition = addText(project.description, margin, yPosition, { fontSize: 9 });
        yPosition += 8;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor);
        doc.text(`CV - José Miguel Amaya - Página ${i} de ${pageCount}`, pageWidth - 50, doc.internal.pageSize.height - 10);
    }
    
    // Download the PDF
    const fileName = currentLanguage === 'en' ? 'Jose_Miguel_Amaya_CV_English.pdf' : 'Jose_Miguel_Amaya_CV_Espanol.pdf';
    doc.save(fileName);
}

// Load saved theme and language on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language') || 'es';
    const themeIcon = document.getElementById('theme-icon');
    const languageText = document.getElementById('language-text');
    
    // Load theme
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
    
    // Load language
    document.body.setAttribute('data-lang', savedLanguage);
    if (savedLanguage === 'en') {
        languageText.textContent = 'ES';
        translatePage('en');
    } else {
        languageText.textContent = 'EN';
        translatePage('es');
    }

    // Animate skill bars on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBars = entry.target.querySelectorAll('.skill-progress');
                skillBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe skill cards
    const skillCards = document.querySelectorAll('.card');
    skillCards.forEach(card => {
        if (card.querySelector('.skill-progress')) {
            observer.observe(card);
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
