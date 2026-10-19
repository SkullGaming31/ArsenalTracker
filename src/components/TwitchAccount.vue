<template>
  <div class="twitch-account">
    <span v-if="loading" class="account-status" role="status">Checking Twitch session...</span>
    <template v-else-if="user">
      <span class="account-name">{{ user.displayName }}</span>
      <button type="button" class="account-button" :disabled="loading" @click="signOut">Sign out</button>
    </template>
    <button v-else type="button" class="account-button" :disabled="!configured" @click="signIn">
      Login with Twitch
    </button>
    <span v-if="message" class="account-status" :role="error ? 'alert' : 'status'">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface TwitchUser {
  id: string
  login: string
  displayName: string
}

interface SessionResponse {
  configured: boolean
  user: TwitchUser | null
}

const user = ref<TwitchUser | null>(null)
const configured = ref(false)
const loading = ref(true)
const message = ref('')
const error = ref(false)

async function loadSession() {
  try {
    const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' })
    if (!response.ok) throw new Error('Session request failed')
    const session = await response.json() as SessionResponse
    configured.value = session.configured
    user.value = session.user
  } catch {
    error.value = true
    message.value = 'Could not check Twitch sign-in status.'
  } finally {
    loading.value = false
  }
}

function clearLoginQuery() {
  const params = new URLSearchParams(window.location.search)
  const result = params.get('twitch_login')
  const reason = params.get('reason')
  if (!result) return null

  params.delete('twitch_login')
  params.delete('reason')
  const query = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  )

  if (result === 'success') return 'success'
  if (reason === 'not-configured') return 'Twitch login is not configured on this deployment.'
  if (reason === 'cancelled') return 'Twitch sign-in was cancelled.'
  if (reason === 'invalid-state') return 'Twitch sign-in could not be verified. Please try again.'
  return 'Twitch sign-in failed. Please try again.'
}

function signIn() {
  window.location.assign('/api/auth/twitch')
}

async function signOut() {
  loading.value = true
  message.value = ''
  error.value = false
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    if (!response.ok) throw new Error('Logout request failed')
    user.value = null
  } catch {
    error.value = true
    message.value = 'Could not sign out. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const loginResult = clearLoginQuery()
  await loadSession()
  if (loginResult === 'success') {
    message.value = user.value ? '' : 'Twitch sign-in did not create a session. Please try again.'
    error.value = !user.value
  } else if (loginResult) {
    message.value = loginResult
    error.value = true
  } else if (!configured.value) {
    message.value = 'Twitch login is not configured on this deployment.'
  }
})
</script>

<style scoped>
.twitch-account { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; color: #f3f3f3; }
.account-name { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #e9d9ff; }
.account-button { min-height: 36px; padding: 7px 12px; border: 1px solid #9147ff; border-radius: 4px; background: #9147ff; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.account-button:hover:not(:disabled) { background: #772ce8; }
.account-button:disabled { opacity: 0.55; cursor: not-allowed; }
.account-status { max-width: 320px; color: #c8c8c8; font-size: 0.8rem; }
[role='alert'] { color: #ffb4ab; }
</style>