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
    doc.text('Backend Developer | Python Specialist | AI & LLM Enthusiast', margin, 30);
    
    yPosition = 50;
    
    // Contact Information
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Contact Information' : 'Información de Contacto', yPosition);
    
    const contactInfo = currentLanguage === 'en' ? [
        'Email: miguel.amaya99@gmail.com',
        'GitHub: github.com/joseamaya',
        'Location: Piura, Peru',
        'Website: https://joseamaya.github.io/'
    ] : [
        'Email: miguel.amaya99@gmail.com',
        'GitHub: github.com/joseamaya',
        'Ubicación: Piura, Perú',
        'Sitio Web: https://joseamaya.github.io/'
    ];
    
    contactInfo.forEach(info => {
        yPosition = addText(info, margin, yPosition, { fontSize: 10, color: secondaryColor });
    });
    
    yPosition += 10;
    
    // About Me
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'About Me' : 'Acerca de mí', yPosition);
    
    const aboutText = currentLanguage === 'en' ? 
        'Backend developer with advanced experience in Python, specialized in building scalable and efficient solutions. Experienced in integrating modern backend architectures and applying AI where it adds value.' :
        'Desarrollador backend con experiencia avanzada en Python, especializado en la creación de soluciones escalables y eficientes. Con experiencia integrando arquitecturas backend modernas y aplicando IA cuando aporta valor.';
    
    yPosition = addText(aboutText, margin, yPosition, { fontSize: 10 });
    yPosition += 10;
    
    // Skills
    yPosition = addSectionHeader(currentLanguage === 'en' ? 'Skills' : 'Habilidades', yPosition);
    
    const skills = [
        'Python (95%)', 'Backend (Django / FastAPI) (90%)', 'LangChain & Langraph (LLMs, RAG) (75%)', 'GNU/Linux (80%)',
        'APIs & Microservices (90%)', 'Databases (SQL / NoSQL) (90%)', 'n8n (Automation) (40%)'
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
    
    // Build experiences from DOM so the PDF matches the page content (handles both legacy header/description blocks and terminal-line blocks)
    function textForLocalized(el) {
        if (!el) return '';
        const attr = currentLanguage === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
        if (attr && attr.trim().length) return attr.trim();
        return el.textContent.trim();
    }

    function parseExperienceItem(item) {
        let title = '';
        let company = '';
        let period = '';
        let description = '';

        const header = item.querySelector('.experience-header');
        const descBlock = item.querySelector('.experience-description');

        if (header) {
            const h4 = header.querySelector('.experience-title');
            const comp = header.querySelector('.experience-company');
            const date = header.querySelector('.experience-date');

            title = textForLocalized(h4) || (h4 ? h4.textContent.trim() : '');
            company = textForLocalized(comp) || (comp ? comp.textContent.trim() : '');
            period = date ? date.textContent.trim() : '';

            if (descBlock) {
                // Prefer localized paragraph inside description
                const localized = descBlock.querySelector('[data-en],[data-es]');
                description = localized ? textForLocalized(localized) : descBlock.textContent.trim();
            }
        } else {
            // terminal-line style
            const lines = item.querySelectorAll('.terminal-line');
            if (lines.length > 0) {
                // First line: contains title and period (period may be in a terminal-argument with muted color)
                const first = lines[0];
                // pick a localized element if present
                const possibleTitle = first.querySelector('[data-en],[data-es]');
                if (possibleTitle) title = textForLocalized(possibleTitle);
                // fallback: find terminal-argument elements
                if (!title) {
                    const args = first.querySelectorAll('.terminal-argument');
                    if (args.length > 0) title = args[0].textContent.trim();
                }

                // period: try to find the muted argument
                const muted = first.querySelector('.terminal-argument[style*="terminal-text-muted"], .terminal-argument[style*="text-muted"], .terminal-argument[style*="--terminal-text-muted"]');
                if (muted) period = muted.textContent.trim();
                else {
                    // sometimes the last span in the first line is the period
                    const args = first.querySelectorAll('span');
                    if (args.length > 0) {
                        const last = args[args.length - 1];
                        const txt = last.textContent.trim();
                        if (/\(|\d{4}/.test(txt)) period = txt;
                    }
                }

                // company: second line normally has company
                if (lines[1]) {
                    const compArg = lines[1].querySelector('[data-en],[data-es]') || lines[1].querySelectorAll('.terminal-argument');
                    if (compArg) {
                        if (compArg.getAttribute) company = textForLocalized(compArg);
                        else if (compArg.length) company = compArg[compArg.length - 1].textContent.trim();
                    }
                }

                // description: remaining lines
                const descParts = [];
                for (let i = 2; i < lines.length; i++) {
                    const localized = lines[i].querySelector('[data-en],[data-es]');
                    if (localized) descParts.push(textForLocalized(localized));
                    else descParts.push(lines[i].textContent.trim());
                }
                description = descParts.join(' ').replace(/\s+/g, ' ').trim();
            }
        }

        return { title, company, period, description };
    }

    // Locate the Experience card and extract all `.experience-item`
    let domExperiences = [];
    try {
        const experienceCard = Array.from(document.querySelectorAll('.card')).find(c => {
            const title = c.querySelector('.card-title');
            if (!title) return false;
            const t = title.getAttribute('data-es') || title.textContent || '';
            return /Experiencia Laboral|Work Experience/i.test(t);
        });

        if (experienceCard) {
            const items = experienceCard.querySelectorAll('.experience-item');
            items.forEach(it => {
                const parsed = parseExperienceItem(it);
                // ensure at least a title exists
                if (parsed.title || parsed.company || parsed.description) domExperiences.push(parsed);
            });
        }
    } catch (err) {
        console.error('Error extrayendo experiencias del DOM:', err);
    }

    // Fallback to the previous hardcoded list if none found
    if (!domExperiences.length) {
        domExperiences = currentLanguage === 'en' ? [
            {
                title: 'CTO - Co-founder',
                company: 'Xprende Tech, Quito',
                period: 'Jun 2019 - Present',
                description: 'I am responsible for leading the technology team and supervising all decisions related to technology and product development of the company.'
            }
        ] : [
            {
                title: 'CTO - Socio Fundador',
                company: 'Xprende Tech, Quito',
                period: 'Jun 2019 - Actualidad',
                description: 'Soy el responsable de liderar el equipo de tecnología y supervisar todas las decisiones relacionadas con la tecnología y el desarrollo de productos de la empresa.'
            }
        ];
    }

    domExperiences.forEach(exp => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        yPosition = addText(exp.title || '', margin, yPosition, { fontSize: 11, fontStyle: 'bold' });
        if (exp.company) yPosition = addText(exp.company, margin, yPosition, { fontSize: 10, color: primaryColor });
        if (exp.period) yPosition = addText(exp.period, margin, yPosition, { fontSize: 9, color: secondaryColor });
        if (exp.description) yPosition = addText(exp.description, margin, yPosition, { fontSize: 9 });
        yPosition += 8;
    });
    
    // Communities & Talks (new card)
    try {
        const communitiesCard = Array.from(document.querySelectorAll('.card')).find(c => {
            const title = c.querySelector('.card-title');
            if (!title) return false;
            const t = (title.getAttribute('data-es') || title.textContent || '').trim();
            return /Comunidades & Charlas|Communities & Talks/i.test(t);
        });

        if (communitiesCard) {
            const communityItems = [];
            const items = communitiesCard.querySelectorAll('.experience-item');
            items.forEach(it => {
                const parsed = parseExperienceItem(it);
                if (parsed.title || parsed.company || parsed.description) communityItems.push(parsed);
            });

            if (communityItems.length) {
                yPosition = addSectionHeader(currentLanguage === 'en' ? 'Communities & Talks' : 'Comunidades & Charlas', yPosition);
                communityItems.forEach(ci => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    yPosition = addText(ci.title || '', margin, yPosition, { fontSize: 11, fontStyle: 'bold' });
                    if (ci.company) yPosition = addText(ci.company, margin, yPosition, { fontSize: 10, color: primaryColor });
                    if (ci.period) yPosition = addText(ci.period, margin, yPosition, { fontSize: 9, color: secondaryColor });
                    if (ci.description) yPosition = addText(ci.description, margin, yPosition, { fontSize: 9 });
                    yPosition += 8;
                });
            }
        }
    } catch (err) {
        console.error('Error extrayendo comunidades del DOM:', err);
    }
    
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
