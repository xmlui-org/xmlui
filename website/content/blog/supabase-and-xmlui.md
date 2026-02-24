Supabase provides a powerful backend: Postgres database, authentication, real-time subscriptions, storage, and edge functions. But building a frontend typically means setting up a build system, managing dependencies, and writing lots of boilerplate.

XMLUI offers a streamlined path. It's a declarative markup language that renders directly in the browser. You describe your UI structure, bind it to data sources, and XMLUI handles the rest. No npm, no bundler, no build step. Supabase handles the backend complexity, XMLUI handles the frontend complexity, and you focus on your application logic.

## The quickstart: reading public data

The [Supabase XMLUI quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/xmlui) demonstrates the basics. Here's a minimal app that reads from a Supabase table.

**index.html**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Supabase + XMLUI</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://xmlui.org/xmlui.js"></script>
  </head>
</html>
```

**Main.xmlui**
```xml
<App name="Supabase + XMLUI">
  <DataSource
    id="instruments"
    url="{appGlobals.supabaseUrl + '/rest/v1/instruments?select=*'}"
    headers="{{
      apikey: appGlobals.supabasePublishableKey
    }}"
  />

  <H1>Instruments</H1>
  <List data="{instruments}">
    <Text value="{$item.name}" />
  </List>
</App>
```

**config.json**
```json
{
  "appGlobals": {
    "supabaseUrl": "https://YOUR_PROJECT.supabase.co",
    "supabasePublishableKey": "YOUR_PUBLISHABLE_KEY"
  }
}
```

This is the entire frontend! The `DataSource` component fetches from Supabase's REST API, and the `List` component renders each row. No JavaScript required in your application code.

## Adding authentication

For apps that require user authentication, you'll need a bit more setup. The Supabase JS client handles the OAuth flow, and XMLUI reacts to the auth state.

**index.html** (with auth)
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Supabase + XMLUI</title>
    <script src="config.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
      const sb = supabase.createClient(window.config.supabaseUrl, window.config.supabaseKey);

      window.authUser = null;
      window.authSession = null;

      window.signIn = () => {
        window.location.href = window.config.supabaseUrl +
          '/auth/v1/authorize?provider=github&redirect_to=' + window.location.origin;
      };

      window.signOut = async () => {
        await sb.auth.signOut();
        window.location.href = '/';
      };

      sb.auth.onAuthStateChange((event, session) => {
        window.authSession = session;
        window.authUser = session?.user || null;
      });

      if (window.location.hash.includes('access_token')) {
        sb.auth.getSession().then(() => {
          window.location.replace('/');
        });
      }
    </script>
    <script src="https://xmlui.org/xmlui.js"></script>
  </head>
</html>
```

**Main.xmlui** (with auth)
```xml
<App name="Supabase + XMLUI">
  <DataSource
    id="notes"
    url="{window.config.supabaseUrl + '/rest/v1/notes?select=*'}"
    when="{window.authSession}"
    headers="{{
      apikey: window.config.supabaseKey,
      Authorization: 'Bearer ' + window.authSession?.access_token
    }}"
  />

  <HStack gap="$space-4" verticalAlignment="center">
    <Button
      when="{!window.authUser}"
      label="Sign In with GitHub"
      onClick="window.signIn()"
    />
    <Text when="{window.authUser}" value="{'Logged in as ' + window.authUser?.email}" />
    <Button when="{window.authUser}" label="Sign Out" onClick="window.signOut()" />
  </HStack>

  <H1>Supabase + XMLUI: Notes</H1>

  <List when="{window.authSession}" data="{notes}">
    <Text value="{$item.content}" />
  </List>
</App>
```

Key points:

- **`when` attribute**: Components only render when their condition is true. The data list and fetch only happen after authentication.
- **Auth headers**: The `Authorization` header passes the user's access token, which Supabase uses for Row Level Security.
- **Reactive binding**: When `window.authSession` changes, XMLUI automatically re-evaluates expressions that reference it.

## Setting up the database

In the Supabase SQL Editor, create the notes table:

```sql
create table public.notes (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  content text not null,
  created_at timestamptz default now()
);
```

Enable row-level security and add policies so users can only access their own notes:

```sql
alter table public.notes enable row level security;

create policy "Users can read own notes"
on public.notes for select
using (auth.uid() = user_id);

create policy "Users can insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);
```

After signing in to the app, you can add test data via the Supabase dashboard's Table Editor, or by adding an insert form to the XMLUI app.

The combination of RLS and the auth token means your frontend code doesn't need to filter data—the database handles access control.

## Why this approach?

For Supabase users, XMLUI provides a low-ceremony frontend option.

For XMLUI users, Supabase provides a complete backend: authentication, database, storage, and APIs are all handled.

For everyone, the declarative approach keeps complexity low. Your UI is a description of what should appear, not imperative code managing state and DOM updates.

## See it in action

  <video src="/blog/images/supabase-demo.mp4" autoPlay="true" loop="true" muted="true" playsInline="true"></video>


## Resources

- [Supabase XMLUI Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/xmlui)
- [XMLUI Documentation](https://xmlui.org)
- [XMLUI DataSource Component](https://xmlui.org/components/DataSource)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
