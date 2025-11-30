
export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
}

export const getGitHubConfig = (): GitHubConfig => {
  const owner = import.meta.env.VITE_REPO_OWNER;
  const repo = import.meta.env.VITE_REPO_NAME;
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    console.error("Missing GitHub configuration. Please check VITE_REPO_OWNER, VITE_REPO_NAME, and VITE_GITHUB_TOKEN.");
  }

  return {
    owner: owner || '',
    repo: repo || '',
    token: token || '',
    branch: 'main' // Default to main, could be configurable
  };
};

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

export const fetchFileFromGitHub = async (path: string) => {
  const { owner, repo, token, branch } = getGitHubConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  const data: GitHubFileResponse = await response.json();
  return {
    content: decodeURIComponent(escape(atob(data.content))), // Handle UTF-8 decoding
    sha: data.sha,
  };
};

export const uploadFileToGitHub = async (
  path: string,
  content: string | ArrayBuffer,
  message: string,
  encoding: 'utf-8' | 'base64' = 'utf-8'
) => {
  const { owner, repo, token, branch } = getGitHubConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Check if file exists to get SHA (for update)
  const existing = await fetchFileFromGitHub(path).catch(() => null);

  let contentBase64 = '';
  if (encoding === 'base64' && content instanceof ArrayBuffer) {
    const bytes = new Uint8Array(content);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    contentBase64 = btoa(binary);
  } else if (typeof content === 'string') {
    contentBase64 = btoa(unescape(encodeURIComponent(content))); // Handle UTF-8 encoding
  }

  const body: any = {
    message,
    content: contentBase64,
    branch,
  };

  if (existing) {
    body.sha = existing.sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub Upload Error: ${response.status} ${errorText}`);
  }

  return await response.json();
};

export const deleteFileFromGitHub = async (
  path: string,
  message: string
) => {
  const { owner, repo, token, branch } = getGitHubConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Get SHA first
  const existing = await fetchFileFromGitHub(path).catch(() => null);
  if (!existing) return; // File doesn't exist, nothing to delete

  const body = {
    message,
    sha: existing.sha,
    branch,
  };

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub Delete Error: ${response.status} ${errorText}`);
  }

  return await response.json();
};
