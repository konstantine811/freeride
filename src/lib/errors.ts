export function errorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  const messages: Record<string,string> = {
    'auth/invalid-credential':'Неправильний email або пароль.',
    'auth/invalid-email':'Перевірте адресу email.',
    'auth/email-already-in-use':'Цей email уже зареєстрований. Увійдіть у свій акаунт.',
    'auth/weak-password':'Пароль має містити щонайменше 8 символів.',
    'auth/popup-closed-by-user':'Вікно входу закрито. Спробуйте ще раз.',
    'auth/configuration-not-found':'Firebase Authentication ще не налаштовано. Відкрийте Authentication у Firebase Console, натисніть Get started та увімкніть спосіб входу.',
    'auth/operation-not-allowed':'Цей спосіб входу ще не увімкнений у Firebase.',
    'auth/unauthorized-domain':'Додайте домен сайту в дозволені домени Firebase Authentication.',
    'auth/too-many-requests':'Забагато спроб. Спробуйте пізніше.',
    'auth/network-request-failed':'Не вдалося підключитися. Перевірте інтернет.',
    'permission-denied':'Недостатньо прав. Перевірте роль користувача та правила Firebase.',
    'storage/unauthorized':'Недостатньо прав для завантаження фото.',
    'storage/retry-limit-exceeded':'Завантаження перервано. Спробуйте ще раз.',
  }
  return messages[code] ?? (error instanceof Error && !code ? error.message : 'Не вдалося виконати дію. Спробуйте ще раз.')
}
