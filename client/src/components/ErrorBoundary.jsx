import { Component } from "react";

/**
 * Catches render errors anywhere below it so a fault in one page shows a
 * recoverable message instead of a blank white screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error:", error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="brand-auth-shell flex items-center justify-center">
        <div className="brand-panel relative z-10 w-full max-w-md p-8 text-center md:p-10">
          <p className="brand-kicker">Something Went Wrong</p>
          <h1 className="brand-title mt-3 !text-3xl">This page hit an error.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Sorry about that. Reloading usually clears it. If it keeps happening,
            please contact us and we will sort it out.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="brand-button"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <a href="/" className="brand-button-ghost">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
