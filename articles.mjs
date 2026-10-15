// Articles du blog, du plus récent au plus ancien. Les 3 premiers s'affichent en bas de l'accueil.
// Ajouter un article : copier un bloc, changer slug (adresse de la page, sans accents ni espaces), date (AAAA-MM-JJ),
// titre, résumé, catégorie et corps (HTML : <p>, <h2>, <ul><li>…). `r` = chemin vers la racine du site pour les liens.
// aVenir: true affiche l'étiquette « À venir » au lieu de la catégorie.
// Puis : node build.mjs
export const ARTICLES = [
  {
    slug: 'journee-culturelle',
    date: '2026-10-15',
    categorie: 'Événement',
    aVenir: true,
    titre: 'Une journée culturelle se prépare',
    resume: 'La communauté comorienne de Toulouse prépare une journée culturelle. Date, lieu et programme seront annoncés ici très bientôt.',
    corps: r => `
<p>Une journée culturelle de la communauté comorienne de Toulouse est en préparation. C’est l’occasion de se retrouver, de faire découvrir notre culture, et de rencontrer celles et ceux que l’on ne croise jamais d’habitude.</p>
<p>La date, le lieu et le programme seront publiés sur ce blog dès qu’ils seront fixés.</p>
<h2>Être prévenu</h2>
<p>Le plus simple pour ne rien manquer : <a class="link" href="${r}adherer/">vous inscrire dans l’annuaire de la communauté</a>. Les inscrits seront les premiers informés.</p>`,
  },
  {
    slug: 'annuaire-de-la-communaute',
    date: '2026-10-15',
    categorie: 'Annuaire',
    titre: 'L’annuaire de la communauté : ce qui est affiché, ce qui ne l’est pas',
    resume: 'Nous recensons les talents de la communauté comorienne de Toulouse. Voici comment fonctionne l’inscription, et comment vos informations sont protégées.',
    corps: r => `
<p>Mécanicien, comptable, coiffeuse, développeur, maman qui prépare des plats comoriens, étudiant qui cherche un stage : la communauté a des compétences partout. L’annuaire sert à les rendre visibles, pour que l’on puisse enfin se trouver.</p>
<h2>Comment s’inscrire</h2>
<p>Le <a class="link" href="${r}adherer/">formulaire d’inscription</a> prend environ deux minutes. Vous indiquez votre commune, votre domaine, votre métier ou ce que vous savez faire, et la distance jusqu’à laquelle vous pouvez vous déplacer pour rendre service.</p>
<h2>Vous choisissez comment apparaître</h2>
<ul>
<li><b>Sous votre prénom</b> : « Prénom N. », avec votre métier et votre commune.</li>
<li><b>De façon anonyme</b> : seuls votre métier et votre commune apparaissent. Quand quelqu’un vous cherche, c’est l’équipe qui fait le lien.</li>
</ul>
<h2>Ce qui n’est jamais publié</h2>
<p>Votre âge, votre date de naissance, votre téléphone, votre e-mail et votre adresse restent privés. Sur la future carte, chacun est placé au centre de sa commune, jamais à son domicile. Chaque fiche est vérifiée par l’équipe avant d’être mise en ligne.</p>
<h2>Et demain, une carte</h2>
<p>Avec les inscriptions, nous préparons une carte interactive : vous cherchez un plombier, un traiteur ou un photographe ? Vous verrez qui, dans la communauté, peut vous aider près de chez vous.</p>`,
  },
  {
    slug: 'pourquoi-ce-reseau',
    date: '2026-10-15',
    categorie: 'Le réseau',
    titre: 'Pourquoi nous lançons le réseau des Comoriens de Toulouse',
    resume: 'Nous sommes nombreux à Toulouse, mais éparpillés. Ce réseau est né d’un constat simple : la compétence est souvent déjà chez nous, encore faut-il se connaître.',
    corps: r => `
<p>Combien de fois avons-nous cherché un mécanicien, un comptable ou un électricien, pour découvrir des mois plus tard qu’un frère croisé à la mosquée ou une sœur du quartier faisait justement ce métier ? La communauté comorienne de Toulouse est grande, mais elle vit en petits cercles qui ne se croisent pas.</p>
<h2>Un point de rassemblement</h2>
<p>Le réseau veut être ce point de rassemblement : un endroit où l’on sait qui fait quoi, où l’on se recommande, où l’on s’entraide. Les étudiants qui arrivent trouvent plus vite un stage, les indépendants se font connaître, les familles trouvent un service près de chez elles.</p>
<h2>Gratuit, sans but commercial</h2>
<p>On nous demande parfois ce que nous y gagnons. La réponse est simple : rien, sinon une communauté plus soudée. Mieux organisés entre nous, nous serons aussi plus faciles à contacter pour les événements menés avec les autres communautés de Toulouse.</p>
<h2>D’abord Toulouse</h2>
<p>Nous commençons par bien faire les choses à Toulouse. Si le modèle fonctionne, il pourra être proposé à d’autres villes. Pour l’instant, la première étape est entre vos mains : <a class="link" href="${r}adherer/">inscrivez-vous dans l’annuaire</a> et faites tourner le lien.</p>`,
  },
];
