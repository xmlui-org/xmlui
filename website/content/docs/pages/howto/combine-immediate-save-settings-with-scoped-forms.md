# Combine immediate-save settings with scoped Forms

Keep settings with different save behavior in different state boundaries: use a dedicated `APICall` for a control that saves immediately, and one scoped `Form` for each group users review and save together.

A settings page often mixes both interaction styles. A preference switch should take effect as soon as it changes, while Delivery and Retention settings should remain independent drafts until the user saves each section.

## Choose save boundaries

This example gives the immediate switch and each grouped save its own request and progress state. The two Forms use the built-in `submitUrl` path, send only their own section, and adopt the server's normalized response as a new pristine baseline.

```xmlui-pg copy display name="Choose save boundaries for settings" id="choose-save-boundaries-for-settings" height="900px"
<App var.digestStatus="{'Saved'}" var.restoringDigest="{false}">
  <script>
    function deliverySection(snapshot) {
      return {
        delivery: {
          senderName: snapshot.delivery.senderName,
          replyTo: snapshot.delivery.replyTo
        }
      };
    }

    function retentionSection(snapshot) {
      return { retention: { days: snapshot.retention.days } };
    }
  </script>

  <DataSource id="settings" url="/api/settings" />

  <APICall
    id="saveDigest"
    method="post"
    url="/api/settings"
    body="{$param}"
    invalidates="{[]}"
    onSuccess="() => { settings.refetch(); digestStatus = 'Saved'; }" />

  <VStack when="{settings.value}" gap="$space-5" padding="$space-5" maxWidth="42rem">
    <VStack gap="$space-2">
      <H3>Notifications</H3>
      <Switch
        id="digestSwitch"
        label="Weekly digest"
        initialValue="{!!settings.value.notifications.weeklyDigest}"
        enabled="{!saveDigest.inProgress}"
        onDidChange="(value) => {
          if (restoringDigest) {
            restoringDigest = false;
          } else {
            digestStatus = 'Saving…';
            saveDigest.execute({ notifications: { weeklyDigest: value } });
          }
        }"
        onError="() => {
          restoringDigest = true;
          digestSwitch.setValue(settings.value.notifications.weeklyDigest);
          digestStatus = 'Could not save — restored the server value';
        }" />
      <Text variant="caption">Status: {digestStatus}</Text>
      <Text variant="caption">
        Server value: {settings.value.notifications.weeklyDigest ? 'On' : 'Off'}
      </Text>
    </VStack>

    <ContentSeparator />

    <VStack gap="$space-2">
      <H3>Delivery</H3>
      <Form
        id="deliveryForm"
        data="{{
          delivery: {
            senderName: settings.value.delivery.senderName,
            replyTo: settings.value.delivery.replyTo
          }
        }}"
        submitUrl="/api/settings"
        submitMethod="post"
        onSuccess="(response) => {
          deliveryForm.reset(deliverySection(response));
          toast('Saved canonical sender: ' + response.delivery.senderName);
        }"
        errorNotificationMessage="Could not save delivery settings."
        hideButtonRowUntilDirty="true"
        cancelLabel=""
        saveLabel="Save delivery settings"
        saveInProgressLabel="Saving delivery settings…"
        submitFeedbackDelay="0">
        <TextBox
          label="Sender name"
          bindTo="delivery.senderName"
          required="true" />
        <TextBox
          label="Reply-to email"
          bindTo="delivery.replyTo"
          required="true"
          pattern="email" />
      </Form>
      <Button
        label="Reset delivery draft"
        variant="outlined"
        onClick="deliveryForm.reset()" />
      <Text variant="caption">Server sender: {settings.value.delivery.senderName}</Text>
    </VStack>

    <ContentSeparator />

    <VStack gap="$space-2">
      <H3>Retention</H3>
      <Form
        id="retentionForm"
        data="{{ retention: { days: settings.value.retention.days } }}"
        submitUrl="/api/settings"
        submitMethod="post"
        onSuccess="(response) => {
          retentionForm.reset(retentionSection(response));
          toast('Saved canonical retention: ' + response.retention.days + ' days');
        }"
        errorNotificationMessage="Could not save retention settings."
        hideButtonRowUntilDirty="true"
        cancelLabel=""
        saveLabel="Save retention settings"
        saveInProgressLabel="Saving retention settings…"
        submitFeedbackDelay="0">
        <NumberBox
          label="Retention days"
          bindTo="retention.days"
          required="true"
          integersOnly="true"
          minValue="1"
          maxValue="365" />
      </Form>
      <Button
        label="Reset retention draft"
        variant="outlined"
        onClick="retentionForm.reset()" />
      <Text variant="caption">Server retention: {settings.value.retention.days} days</Text>
    </VStack>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.settings = { notifications: { weeklyDigest: false }, delivery: { senderName: 'Bram Team', replyTo: 'ops@example.com' }, retention: { days: 30 } }; $state.digestAttempts = 0",
  "operations": {
    "get-settings": {
      "url": "/settings",
      "method": "get",
      "handler": "return { notifications: { ...$state.settings.notifications }, delivery: { ...$state.settings.delivery }, retention: { ...$state.settings.retention } }"
    },
    "update-settings": {
      "url": "/settings",
      "method": "post",
      "handler": "if ($requestBody.notifications) { delay(300); $state.digestAttempts++; if ($state.digestAttempts === 1) { throw Error('Demo failure on the first immediate save'); } $state.settings.notifications = { ...$state.settings.notifications, ...$requestBody.notifications }; } if ($requestBody.delivery) { delay(500); $state.settings.delivery = { senderName: $requestBody.delivery.senderName.trim(), replyTo: $requestBody.delivery.replyTo.trim().toLowerCase() }; } if ($requestBody.retention) { delay(450); $state.settings.retention = { days: Math.max(7, Math.min(364, Math.round(Number($requestBody.retention.days) / 7) * 7)) }; } return { notifications: { ...$state.settings.notifications }, delivery: { ...$state.settings.delivery }, retention: { ...$state.settings.retention } }"
    }
  }
}
---desc
The first Weekly digest change intentionally fails so the example can demonstrate rollback. The server trims Delivery values, lowercases the email, and rounds Retention to a whole-week boundary.
```

**Choose one state boundary per save transaction**: The Weekly digest switch is atomic, so it sends a small partial update immediately. Delivery and Retention each have their own Form because each group is validated, submitted, and retried independently. A pending save disables only that Form; drafts and controls in sibling boundaries remain usable.

**Use Form's built-in submission path for grouped settings**: `submitUrl` and `submitMethod` let each Form own validation, request progress, error feedback, and its single-flight submission policy. Because each Form's `data` contains only its own branch, the API receives a partial settings payload.

**Adopt server-confirmed values as the new baseline**: The API trims Delivery text, lowercases the email, and rounds Retention to a whole-week boundary. Each `onSuccess` receives that canonical response and calls `form.reset(canonicalSection)`. The Form becomes pristine, displays what the server accepted, and a later parameterless `reset()` returns to this new baseline.

**Rollback an immediate control when its write fails**: The switch changes visually before its request finishes. Its local `onError` restores the DataSource value. Because `setValue()` fires `onDidChange`, the `restoringDigest` guard prevents the rollback from sending another request.

## Reconcile external changes

Save boundaries solve only one part of the problem. A polling result, subscription event, or another user's update can arrive while a Form is open. Route each incoming snapshot through one reconciliation function: pristine Forms adopt it; dirty Forms keep the user's draft and disclose that a newer server value is available.

```xmlui-pg copy display name="Reconcile external changes with a scoped Form" id="reconcile-external-changes-with-a-scoped-form" height="640px"
<App var.latestDelivery="{null}" var.deliveryChangedElsewhere="{false}">
  <script>
    function deliverySection(snapshot) {
      return {
        delivery: {
          senderName: snapshot.delivery.senderName,
          replyTo: snapshot.delivery.replyTo
        }
      };
    }

    function receiveDeliverySnapshot(snapshot) {
      const incoming = deliverySection(snapshot);

      if (deliveryForm.isDirty()) {
        latestDelivery = incoming;
        deliveryChangedElsewhere = true;
      } else {
        deliveryForm.reset(incoming);
        latestDelivery = null;
        deliveryChangedElsewhere = false;
      }
    }

    function reloadDelivery() {
      deliveryForm.reset(latestDelivery);
      latestDelivery = null;
      deliveryChangedElsewhere = false;
    }
  </script>

  <DataSource id="settings" url="/api/settings" />

  <APICall
    id="simulateExternalUpdate"
    method="post"
    url="/api/settings/external"
    invalidates="{[]}"
    onSuccess="(snapshot) => {
      receiveDeliverySnapshot(snapshot);
      settings.refetch();
    }" />

  <VStack when="{settings.value}" gap="$space-4" padding="$space-5" maxWidth="42rem">
    <Button
      label="Simulate external update"
      variant="outlined"
      enabled="{!simulateExternalUpdate.inProgress}"
      onClick="simulateExternalUpdate.execute()" />

    <Form
      id="deliveryForm"
      data="{{
        delivery: {
          senderName: settings.value.delivery.senderName,
          replyTo: settings.value.delivery.replyTo
        }
      }}"
      submitUrl="/api/settings"
      submitMethod="post"
      onSuccess="(response) => {
        deliveryForm.reset(deliverySection(response));
        latestDelivery = null;
        deliveryChangedElsewhere = false;
      }"
      errorNotificationMessage="Could not save delivery settings."
      hideButtonRowUntilDirty="true"
      cancelLabel=""
      saveLabel="Save delivery settings"
      saveInProgressLabel="Saving delivery settings…"
      submitFeedbackDelay="0">
      <TextBox
        label="Sender name"
        bindTo="delivery.senderName"
        required="true" />
      <TextBox
        label="Reply-to email"
        bindTo="delivery.replyTo"
        required="true"
        pattern="email" />
    </Form>

    <HStack when="{deliveryChangedElsewhere}" verticalAlignment="center">
      <Text variant="strong">Settings changed elsewhere.</Text>
      <Button label="Reload server values" onClick="reloadDelivery()" />
    </HStack>

    <Button
      label="Reset delivery draft"
      variant="outlined"
      onClick="deliveryForm.reset()" />
    <Text variant="caption">Server sender: {settings.value.delivery.senderName}</Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.settings = { delivery: { senderName: 'Bram Team', replyTo: 'ops@example.com' } }; $state.externalRevision = 0",
  "operations": {
    "get-settings": {
      "url": "/settings",
      "method": "get",
      "handler": "return { delivery: { ...$state.settings.delivery } }"
    },
    "update-settings": {
      "url": "/settings",
      "method": "post",
      "handler": "delay(400); $state.settings.delivery = { senderName: $requestBody.delivery.senderName.trim(), replyTo: $requestBody.delivery.replyTo.trim().toLowerCase() }; return { delivery: { ...$state.settings.delivery } }"
    },
    "external-update": {
      "url": "/settings/external",
      "method": "post",
      "handler": "delay(350); $state.externalRevision++; $state.settings.delivery = { senderName: 'Server Team ' + $state.externalRevision, replyTo: 'server' + $state.externalRevision + '@example.com' }; return { delivery: { ...$state.settings.delivery } }"
    }
  }
}
---desc
Try the external update first with a pristine Form, then edit the sender name and run it again. The dirty draft remains visible until you explicitly reload the newer server values.
```

**Use one reconciliation entry point**: The external update's actual response is passed to `receiveDeliverySnapshot()`. Its subsequent `settings.refetch()` updates the server-value caption; it does not reconcile the Form. In production, polling and subscription handlers should pass their snapshots through the same function.

**Preserve dirty drafts rather than overwriting them**: A pristine Form adopts an incoming canonical section immediately with `reset(data)`. A dirty Form retains its visible draft, remembers the newest section, displays **Settings changed elsewhere**, and offers **Reload server values**. Reload is an explicit discard that installs the remembered section as the new pristine baseline.

**Treat a successful save response as authoritative**: The Form's `onSuccess` installs the POST response and clears any pending external snapshot. If a save-generated subscription event arrives first, the same reconciliation function will defer it because the Form is still dirty; the later POST response establishes the authoritative baseline. This ordering is a policy choice, so document a different rule if your backend has different guarantees.

**Draft preservation is not conflict resolution**: It prevents an incoming snapshot from silently erasing unsaved input. This demo's API uses last-write-wins, so saving an old draft can still overwrite a newer server value. Production systems that must prevent stale writes should send a revision or ETag and reject mismatches, or present an explicit merge UI.

---

## See also

- [Prefill a form from an API response](/docs/howto/prefill-a-form-from-an-api-response) — initialize a Form from canonical server data
- [Reset a form after submission](/docs/howto/reset-a-form-after-submission) — choose post-submit data behavior
- [Show validation progress in the Save button](/docs/howto/show-validation-progress-in-the-save-button) — Form's validation and submission labels
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — expose retry behavior for a mutation
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — choose between automatic invalidation and explicit refetching
