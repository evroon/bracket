"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[985],{8278:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>a,contentTitle:()=>s,default:()=>l,frontMatter:()=>c,metadata:()=>d,toc:()=>i});var t=o(5893),r=o(1151);const c={},s="Docker",d={id:"deployment/docker",title:"Docker",description:"This section describes how to deploy Bracket (frontend and backend) to docker using docker-compose.",source:"@site/docs/deployment/docker.md",sourceDirName:"deployment",slug:"/deployment/docker",permalink:"/docs/deployment/docker",draft:!1,unlisted:!1,editUrl:"https://github.com/evroon/bracket/tree/master/docs/docs/deployment/docker.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Cloud services",permalink:"/docs/deployment/cloud-services"},next:{title:"Nomad",permalink:"/docs/deployment/nomad"}},a={},i=[];function p(e){const n={code:"code",h1:"h1",p:"p",pre:"pre",...(0,r.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"docker",children:"Docker"}),"\n",(0,t.jsx)(n.p,{children:"This section describes how to deploy Bracket (frontend and backend) to docker using docker-compose."}),"\n",(0,t.jsx)(n.p,{children:"First, make sure you have docker and docker-compose installed."}),"\n",(0,t.jsxs)(n.p,{children:["Then, store the following YAML in a file called ",(0,t.jsx)(n.code,{children:"docker-compose.yml"})," and run it using\n",(0,t.jsx)(n.code,{children:"docker-compose up -d"})," in the same directory as the file:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:'version: \'3.1\'\n\nservices:\n    bracket-frontend:\n        image: ghcr.io/evroon/bracket-frontend\n        container_name: bracket-frontend\n        ports:\n            - "3000:3000"\n        environment:\n            NEXT_PUBLIC_API_BASE_URL: "https://bracket.mywebsite.com"\n            # Go to https://dashboard.hcaptcha.com/signup, create a site and put the site key here\n            NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "xxxxx"\n            NODE_ENV: "production"\n        restart: unless-stopped\n\n    bracket-backend:\n        image: ghcr.io/evroon/bracket-backend\n        container_name: bracket-backend\n        ports:\n            - "8400:8400"\n        environment:\n            ENVIRONMENT: "PRODUCTION"\n            PG_DSN: "postgresql://bracket_prod:bracket_prod@postgres:5432/bracket_prod"\n        restart: unless-stopped\n        depends_on:\n          - postgres\n\n    postgres:\n        image: postgres\n        restart: always\n        environment:\n          POSTGRES_DB: bracket_prod\n          POSTGRES_USER: bracket_prod\n          POSTGRES_PASSWORD: bracket_prod\n'})})]})}function l(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(p,{...e})}):p(e)}},1151:(e,n,o)=>{o.d(n,{Z:()=>d,a:()=>s});var t=o(7294);const r={},c=t.createContext(r);function s(e){const n=t.useContext(c);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),t.createElement(c.Provider,{value:n},e.children)}}}]);