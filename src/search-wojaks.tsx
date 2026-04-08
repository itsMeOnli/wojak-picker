// @ts-nocheck
import { Action, ActionPanel, Cache, Clipboard, closeMainWindow, environment, Grid, Icon, showHUD, showToast, Toast } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import Fuse from "fuse.js";
import { existsSync } from "fs";
import { join } from "path";
import { useEffect, useMemo, useState } from "react";
import wojaksData from "../assets/wojaks.json";

type Wojak = {
  id: string;
  name: string;
  slug: string;
  category: string;
  filename: string;
  extension: string;
  sourcePageUrl: string;
  thumbUrl: string;
  fullUrl: string;
  localPath: string;
  pageNumber: number;
};

const wojaks = (wojaksData as Wojak[]).map((wojak) => ({
  ...wojak,
  assetPath: join(environment.assetsPath, wojak.localPath.replace(/^assets[\\/]/, "")),
}));

const allCategoriesLabel = "All Categories";
const categories = [allCategoriesLabel, ...Array.from(new Set(wojaks.map((wojak) => wojak.category))).sort()];
const pageSize = 100;
const searchDebounceMs = 150;
const resultCache = new Cache({ namespace: "search-wojaks" });
const wojaksById = new Map(wojaks.map((wojak) => [wojak.id, wojak]));
const categoryPools = new Map(
  categories.map((category) => [
    category,
    category === allCategoriesLabel ? wojaks : wojaks.filter((wojak) => wojak.category === category),
  ]),
);
const fuseByCategory = new Map();

function createFuse(items: typeof wojaks) {
  return new Fuse(items, {
    keys: [
      { name: "name", weight: 0.7 },
      { name: "category", weight: 0.2 },
      { name: "filename", weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

function getFuse(category: string) {
  if (!fuseByCategory.has(category)) {
    const pool = categoryPools.get(category) ?? wojaks;
    fuseByCategory.set(category, createFuse(pool));
  }

  return fuseByCategory.get(category);
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function getCachedSearchResults(cacheKey: string) {
  const cached = resultCache.get(cacheKey);
  if (!cached) {
    return undefined;
  }

  try {
    return JSON.parse(cached)
      .map((id: string) => wojaksById.get(id))
      .filter(Boolean);
  } catch {
    resultCache.remove(cacheKey);
    return undefined;
  }
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isCopying, setIsCopying] = useState(false);
  const {
    value: storedCategory,
    setValue: setStoredCategory,
    isLoading: isCategoryLoading,
  } = useLocalStorage("wojak-picker.selected-category", allCategoriesLabel);

  const selectedCategory = categories.includes(storedCategory ?? "") ? storedCategory ?? allCategoriesLabel : allCategoriesLabel;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, searchDebounceMs);

    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [debouncedSearchText, selectedCategory]);

  const filteredWojaks = useMemo(() => {
    const pool = categoryPools.get(selectedCategory) ?? wojaks;
    const normalizedQuery = normalizeQuery(debouncedSearchText);

    if (!normalizedQuery) {
      return pool;
    }

    const cacheKey = `${selectedCategory}::${normalizedQuery}`;
    const cachedResults = getCachedSearchResults(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    const results = getFuse(selectedCategory)
      .search(normalizedQuery)
      .map((result) => result.item);

    resultCache.set(cacheKey, JSON.stringify(results.map((wojak) => wojak.id)));
    return results;
  }, [debouncedSearchText, selectedCategory]);

  const visibleWojaks = useMemo(() => {
    return filteredWojaks.slice(0, visibleCount);
  }, [filteredWojaks, visibleCount]);

  const hasMore = visibleWojaks.length < filteredWojaks.length;
  const isFiltering = searchText !== debouncedSearchText || isCategoryLoading;

  async function handleCopy(wojak: (typeof wojaks)[number]) {
    if (!existsSync(wojak.assetPath)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Missing local asset",
        message: wojak.name,
      });
      return;
    }

    setIsCopying(true);

    try {
      await Clipboard.copy({ file: wojak.assetPath });
      await closeMainWindow();
      await showHUD(`Copied ${wojak.name} to clipboard`);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: `Couldn't copy ${wojak.name}`,
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <Grid
      columns={6}
      inset={Grid.Inset.Small}
      isLoading={isCopying || isFiltering}
      searchBarPlaceholder="Search wojaks by name or category"
      searchText={searchText}
      onSearchTextChange={setSearchText}
      pagination={{
        pageSize,
        hasMore,
        onLoadMore: () => setVisibleCount((current) => current + pageSize),
      }}
      searchBarAccessory={
        <Grid.Dropdown
          tooltip="Filter by category"
          storeValue
          onChange={(category) => void setStoredCategory(category)}
          value={selectedCategory}
        >
          {categories.map((category) => (
            <Grid.Dropdown.Item key={category} title={category} value={category} />
          ))}
        </Grid.Dropdown>
      }
    >
      {visibleWojaks.length === 0 ? (
        <Grid.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No wojaks found"
          description="Try a different search term or category."
        />
      ) : (
        visibleWojaks.map((wojak) => (
          <Grid.Item
            key={wojak.id}
            id={wojak.id}
            content={{ source: wojak.thumbUrl }}
            title={wojak.name}
            subtitle={wojak.category}
            keywords={[wojak.name, wojak.category, wojak.filename]}
            actions={
              <ActionPanel>
                <Action
                  title="Copy Image to Clipboard"
                  icon={Icon.Clipboard}
                  onAction={() => handleCopy(wojak)}
                />
                <Action.CopyToClipboard
                  title="Copy Source URL"
                  content={wojak.fullUrl}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
                <Action.OpenInBrowser
                  title="Open Source Image"
                  url={wojak.fullUrl}
                  shortcut={{ modifiers: ["cmd"], key: "o" }}
                />
                <Action.OpenInBrowser
                  title="Open Category Page"
                  url={wojak.sourcePageUrl}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </Grid>
  );
}
