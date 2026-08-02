import React from 'react';
import { Button, Result } from 'antd';

/** Keeps a failed lazy page from breaking navigation in the rest of the app. */
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.locationKey !== this.props.locationKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <Result
          status="error"
          title="Не удалось открыть страницу"
          subTitle="Обновите страницу или вернитесь на главную. Если ошибка повторится, попробуйте позже."
          extra={<Button type="primary" onClick={() => window.location.assign('/')}>На главную</Button>}
        />
      );
    }
    return this.props.children;
  }
}
