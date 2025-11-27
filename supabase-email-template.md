# Template de Email para Reset Password en Supabase

## Instrucciones:

1. Ve a **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Selecciona el template **"Reset Password"**
3. Reemplaza todo el contenido con el siguiente código:

```html
<h2>Reimposta la tua password</h2>

<p>Ciao,</p>

<p>Hai richiesto di reimpostare la password per il tuo account Phoebe.</p>

<p><strong>Il tuo codice di verifica è:</strong></p>

<p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; padding: 20px; background-color: #f0f7fa; border: 2px solid #0B3D4D; border-radius: 8px; margin: 20px 0; color: #0B3D4D;">
  COPIA IL LINK QUI SOTTO
</p>

<p>Apri l'app Phoebe e inserisci il codice che trovi nel link qui sotto.</p>

<p style="word-break: break-all; font-size: 12px; color: #0B3D4D; padding: 15px; background-color: #f5f5f5; border-radius: 6px; margin: 20px 0;">
  {{ .ConfirmationURL }}
</p>

<p><strong>Come usare il codice:</strong></p>
<ol style="color: #666; line-height: 1.8;">
  <li>Apri l'app Phoebe</li>
  <li>Nella schermata "Verifica codice", inserisci gli ultimi 6 caratteri del link qui sopra</li>
  <li>Oppure copia tutto il link e incollalo nell'app</li>
</ol>

<p style="color: #666; font-size: 12px; margin-top: 20px;">
  <strong>Importante:</strong> Se non hai richiesto questo reset, ignora questa email. Il link scadrà tra 1 ora.
</p>
```

## Alternativa más simple (si prefieres mostrar solo el link):

```html
<h2>Reimposta la tua password</h2>

<p>Ciao,</p>

<p>Hai richiesto di reimpostare la password per il tuo account Phoebe.</p>

<p>Per completare il processo:</p>

<ol style="line-height: 2;">
  <li>Apri l'app Phoebe</li>
  <li>Copia il link qui sotto</li>
  <li>Nell'app, incolla il link o inserisci gli ultimi 6 caratteri del link come codice di verifica</li>
</ol>

<p style="word-break: break-all; font-size: 11px; color: #0B3D4D; padding: 15px; background-color: #f0f7fa; border: 1px solid #0B3D4D; border-radius: 6px; margin: 20px 0;">
  {{ .ConfirmationURL }}
</p>

<p style="color: #666; font-size: 12px; margin-top: 20px;">
  Se non hai richiesto questo reset, ignora questa email.
</p>
```

