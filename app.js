const repoOwner = 'leandroalvessi';
const repoName = 'ArenaSoundRelease';
const repoUrl = `https://github.com/${repoOwner}/${repoName}`;
const latestReleaseUrl = `${repoUrl}/releases/latest`;
const releasesUrl = `${repoUrl}/releases`;
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

const platformMatchers = {
  windows: [/\.exe$/i, /setup/i, /installer/i],
  mac: [/\.dmg$/i],
  linux: [/\.appimage$/i]
};

const downloadCards = Array.from(document.querySelectorAll('.dl-card'));
const allReleasesLinkNode = document.getElementById('allReleasesLink');

function findAsset(assets, platform) {
  const matchers = platformMatchers[platform] || [];

  return assets.find((asset) => matchers.some((matcher) => matcher.test(asset.name)));
}

function setCardLink(card, asset, releasePageUrl) {
  const subtitleNode = card.querySelector('.dl-ext');
  const buttonNode = card.querySelector('.dl-btn');

  card.classList.remove('is-missing');

  if (asset) {
    card.href = asset.browser_download_url;
    card.title = `Baixar ${asset.name}`;
    subtitleNode.textContent = asset.name;
    buttonNode.textContent = 'Baixar agora';
    return;
  }

  card.classList.add('is-missing');
  card.href = releasePageUrl;
  card.title = 'Abrir página da release mais recente';
  buttonNode.textContent = 'Ver release';
}

async function loadRelease() {
  if (allReleasesLinkNode) {
    allReleasesLinkNode.href = releasesUrl;
  }

  for (const card of downloadCards) {
    card.href = latestReleaseUrl;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API respondeu com ${response.status}`);
    }

    const release = await response.json();
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const releasePageUrl = release.html_url || latestReleaseUrl;

    for (const card of downloadCards) {
      const asset = findAsset(assets, card.dataset.platform);
      setCardLink(card, asset, releasePageUrl);
    }
  } catch (error) {
    for (const card of downloadCards) {
      card.classList.add('is-missing');
      card.href = latestReleaseUrl;
      card.title = 'Abrir página de releases';
    }

    console.error(error);
  }
}

loadRelease();