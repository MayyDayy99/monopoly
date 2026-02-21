import { Component, type ReactNode, type ErrorInfo } from 'react';
import logoKicsi from '../assets/logo_kicsi.png';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        console.error('[Monopoly ErrorBoundary]', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleFullReset = () => {
        localStorage.removeItem('monopoly_save');
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0c0e14',
                    padding: '2rem',
                }}>
                    <div style={{
                        background: '#1a1d28',
                        border: '1px solid rgba(201, 168, 76, 0.3)',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        textAlign: 'center',
                        color: '#eae8e0',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.5rem',
                            color: '#c9a84c',
                            marginBottom: '0.5rem',
                        }}>
                            Hiba történt!
                        </h2>
                        <p style={{ color: '#9a97a0', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            A játékmotor hibát észlelt. Próbáld újra, vagy indíts új játékot.
                        </p>
                        {this.state.error && (
                            <pre style={{
                                background: '#22263a',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                color: '#f87171',
                                overflow: 'auto',
                                maxHeight: '120px',
                                textAlign: 'left',
                                marginBottom: '1rem',
                            }}>
                                {this.state.error.message}
                            </pre>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    background: 'linear-gradient(135deg, #c9a84c, #9a7a30)',
                                    color: '#0c0e14',
                                    fontWeight: 700,
                                    padding: '0.5rem 1.2rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                }}
                            >
                                🔄 Újrapróbálás
                            </button>
                            <button
                                onClick={this.handleFullReset}
                                style={{
                                    background: '#353a52',
                                    color: '#eae8e0',
                                    padding: '0.5rem 1.2rem',
                                    border: '1px solid rgba(201, 168, 76, 0.15)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <img src={logoKicsi} alt="" style={{ width: '16px', height: 'auto' }} />
                                Új játék
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
