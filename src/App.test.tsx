import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const validConfig = {
  environment: 'qa',
  supabaseUrl: 'https://qa-project.supabase.co',
  supabaseAnonKey: 'qa-anon-key',
  userServiceUrl: 'https://user-service-qa.onrender.com',
};

function stubConfigResponse(body: string, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.pushState({}, '', '/');
});

describe('App at boot', () => {
  it('renders the shell with header, nav and home page when the config is valid', async () => {
    stubConfigResponse(JSON.stringify(validConfig));

    render(<App />);

    expect(await screen.findByRole('banner')).toHaveTextContent('swapr');
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/config.json');
  });

  it.each(['local', 'qa'])('shows the %s environment badge in the header', async (environment) => {
    stubConfigResponse(JSON.stringify({ ...validConfig, environment }));

    render(<App />);

    expect(await screen.findByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Environment' })).toHaveTextContent(environment);
  });

  it('shows no environment badge in prod', async () => {
    stubConfigResponse(JSON.stringify({ ...validConfig, environment: 'prod' }));

    render(<App />);

    expect(await screen.findByRole('banner')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Environment' })).not.toBeInTheDocument();
  });

  it('shows the configuration error screen when the config fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Configuration error' })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it.each([
    ['the response status is not OK', JSON.stringify(validConfig), 404],
    ['the body is not valid JSON', '<!doctype html><html></html>', 200],
    ['a key is missing', JSON.stringify({ ...validConfig, supabaseAnonKey: undefined }), 200],
    ['a key is empty', JSON.stringify({ ...validConfig, userServiceUrl: '' }), 200],
    ['a key is not a string', JSON.stringify({ ...validConfig, supabaseUrl: 42 }), 200],
    ['the environment is unknown', JSON.stringify({ ...validConfig, environment: 'staging' }), 200],
  ])('shows the configuration error screen when %s', async (_case, body, status) => {
    stubConfigResponse(body, status);

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Configuration error' })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('renders the not-found message inside the shell for an unknown route', async () => {
    window.history.pushState({}, '', '/no-such-page');
    stubConfigResponse(JSON.stringify(validConfig));

    render(<App />);

    expect(await screen.findByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Page not found');
    expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument();
  });
});
