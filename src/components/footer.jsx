import React from 'react';

function Footer() {
  const userEmail = 'mathnlzz@gmail.com';
  const emailSubject = encodeURIComponent("Contato sobre seu Portfólio - Concessionária Nunes");
  const emailBody = encodeURIComponent("Olá, Matheus!\n\nVi seu projeto 'Concessionária Nunes' e gostaria de conversar sobre uma oportunidade.\n\nAtenciosamente,");

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/MatheusNLima',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/matheus-lima-13397b1b5/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.23 0H1.77C.79 0 0 .79 0 1.77v20.46C0 23.21.79 24 1.77 24h20.46c.98 0 1.77-.79 1.77-1.77V1.77C24 .79 23.21 0 22.23 0zM7.06 20.45H3.53V9h3.53v11.45zM5.3 7.52c-1.11 0-2.01-.9-2.01-2.01s.9-2.01 2.01-2.01 2.01.9 2.01 2.01-.9 2.01-2.01 2.01zm15.15 12.93h-3.53v-5.68c0-1.35-.02-3.1-1.89-3.1-1.89 0-2.18 1.48-2.18 3v5.78h-3.53V9h3.39v1.56h.05c.47-.89 1.62-1.82 3.34-1.82 3.58 0 4.24 2.35 4.24 5.4v6.29z"/>
        </svg>
      )
    },
    {
      name: 'Contate-nos',
      url: `mailto:${userEmail}?subject=${emailSubject}&body=${emailBody}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/>
        </svg>
      )
    }
  ];

  return (
    <footer>
      <div className="footer-links">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visite meu ${link.name}`}
            className="footer-icon-link"
          >
            {link.icon}
          </a>
        ))}
      </div>
      <p>© 2025 Concessionária Nunes. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Footer;