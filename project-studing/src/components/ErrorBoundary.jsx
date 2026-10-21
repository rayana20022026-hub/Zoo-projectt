import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Admin page rendering failed.', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="route-error" role="alert">
          <h1>Страница не загрузилась</h1>
          <p>Произошла ошибка при отображении страницы. Попробуйте загрузить её ещё раз.</p>
          <button onClick={() => this.setState({ hasError: false })} type="button">Повторить</button>
        </main>
      )
    }

    return this.props.children
  }
}
