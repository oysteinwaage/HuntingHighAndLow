import { Navigate } from 'react-router-dom'
import { Center, Loader } from '@mantine/core'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Center h="100svh">
        <Loader color="forest" />
      </Center>
    )
  }

  if (!user) {
    return <Navigate to="/logg-inn" replace />
  }

  return children
}
