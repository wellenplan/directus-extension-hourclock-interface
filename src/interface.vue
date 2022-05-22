<template>
  <template v-if="items.loading && items.items.length === 0">
    <v-skeleton-loader type="input-tall"></v-skeleton-loader>
  </template>
  <template v-else>
    <div class="v-form grid with-fill">
      <div class="field half">
        <template v-if="needsSave">
          <div class="warning">
            {{ t("hour-clocks.save-to-display") }}
          </div>
        </template>
        <template v-else>
          <HourclockPie :data="pieData" :emptyColor="emptyColor" />
        </template>
      </div>
      <div class="field half-right">
        <ListO2M
          :value="value"
          :primaryKey="props.primaryKey"
          :collection="props.collection"
          :field="props.field"
          :template="props.template"
          :disabled="props.disabled"
          :enableCreate="props.enableCreate"
          :enableSelect="props.enableSelect"
          :filter="props.filter"
          @input="value = $event"
        />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { withDefaults, computed, reactive, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { useExtensions, useItems } from "@directus/extensions-sdk";
import { Filter } from "@directus/shared/types";
import HourclockPie from "@wellenplan/vue-hourclock-pie";

const { t } = useI18n();

const { interfaces } = useExtensions();
// TODO: figure out a way to build on list-o2m w/o relying on what is probably not part of the sdk
const ListO2M = interfaces.value.find(({ id }) => id === "list-o2m")?.component;

const props = withDefaults(
  defineProps<{
    value?: (number | string | Record<string, any>)[] | Record<string, any>;
    primaryKey: string;
    collection: string;
    field: string;
    resolution?: number;
    template?: string;
    disabled?: boolean;
    enableCreate?: boolean;
    enableSelect?: boolean;
    filter?: Filter | null;
  }>(),
  {
    value: () => [],
    disabled: false,
    enableCreate: true,
    enableSelect: true,
    filter: () => null,
  }
);
const { collection, primaryKey } = toRefs(props);

const emit = defineEmits<{
  (e: "input", val: any): void;
}>();

type valueType = {
  create: any;
  update: any;
  delete: any;
};

const value = computed({
  get: () => props.value,
  set: (val) => {
    emit("input", val);
  },
});

// gets data from collections
const fetchSlices = () => {
  const opts = {
    filter: {
      id: primaryKey.value,
    },
    fields: [
      "slices.id",
      "slices.sort",
      "slices.color",
      "slices.title",
      "slices.duration",
    ],
  };
  // @ts-ignore
  return useItems(collection, opts);
};

const items = reactive(fetchSlices());

// combination of remote data + locally staged changes for display
const patched = computed(() => {
  if (!value) {
    return items;
  }
  if (items.loading) {
    return items;
  }
  const slices = items.items[0]?.slices;
  if (!slices) {
    return items;
  }
  const { update, delete: toDelete } = <valueType>value.value;

  if (update) {
    for (const slice of update) {
      const index = slices.findIndex((s) => s.id === slice.id);
      if (index > -1) {
        slices[index] = slice;
      }
    }
  }
  if (toDelete) {
    for (const id of toDelete) {
      const index = slices.findIndex((s) => s.id === id);
      if (index > -1) {
        slices[index].deleted = true;
      }
    }
  }

  const newItems = items;
  newItems.items[0].slices = slices;
  return newItems;
});

const needsSave = computed(() => {
  const { create } = <valueType>value.value;
  if (!create) {
    return false;
  }
  return create.length > 0;
});

const pieData = computed(() => {
  const slices = patched.value.items[0]?.slices || [];
  const sorted = slices.sort((a, b) => a.sort - b.sort);

  return sorted.map((slice) => {
    return {
      value: slice.duration,
      color: slice.color,
      label: slice.title,
    };
  });
});

const emptyColor = computed(() => {
  return getComputedStyle(document.body).getPropertyValue("--background-page");
});
</script>

<style scoped>
div.grid {
  display: grid;
  grid-template-columns:
    [start] minmax(0, var(--form-column-max-width)) [half] minmax(
      0,
      var(--form-column-max-width)
    )
    [full];
  gap: var(--form-vertical-gap) var(--form-horizontal-gap);
}

@media (min-width: 960px) {
  div.half {
    grid-column: start/half;
  }
}
</style>
