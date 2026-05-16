import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AccessRequestForm } from "./AccessRequestForm";

class AccessRequestBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[access-request] erro de renderização isolado", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
          <h2 className="font-heading text-xl font-bold text-foreground">Solicitar Acesso</h2>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o formulário neste instante. Tente abrir novamente.
          </p>
          <Button type="button" variant="outline" onClick={() => this.setState({ failed: false })}>
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function SafeAccessRequestForm({ onBack }: { onBack: () => void }) {
  return (
    <AccessRequestBoundary>
      <AccessRequestForm onBack={onBack} />
    </AccessRequestBoundary>
  );
}