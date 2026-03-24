import React from "react";
import { View, Text, Pressable } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-maritime-base items-center justify-center px-8">
          <Text className="text-maritime-white text-xl font-semibold mb-2">
            Bir şeyler ters gitti
          </Text>
          <Text className="text-maritime-muted text-sm text-center mb-6">
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-maritime-teal px-6 items-center justify-center"
          >
            <Text className="text-maritime-base text-sm font-semibold">
              Tekrar Dene
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
