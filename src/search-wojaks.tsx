// @ts-nocheck
import { Action, ActionPanel, Clipboard, closeMainWindow, environment, Grid, Icon, showHUD, showToast, Toast } from "@raycast/api";
import Fuse from "fuse.js";
import { existsSync } from "fs";
import { join } from "path";
import { useMemo, useState } from "react";
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
const defaultVisibleCount = 180;
const searchVisibleCount = 240;

const fuse = new Fuse(wojaks, {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "category", weight: 0.2 },
    { name: "filename", weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
});

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel);
  const [isLoading, setIsLoading] = useState(false);

  const filteredWojaks = useMemo(() => {
    const pool =
      selectedCategory === allCategoriesLabel
        ? wojaks
        : wojaks.filter((wojak) => wojak.category === selectedCategory);

    if (!searchText.trim()) {
      return pool;
    }

    if (selectedCategory === allCategoriesLabel) {
      return fuse.search(searchText).map((result) => result.item);
    }

    const scopedFuse = new Fuse(pool, {
      keys: [
        { name: "name", weight: 0.75 },
        { name: "filename", weight: 0.15 },
        { name: "category", weight: 0.1 },
      ],
      threshold: 0.3,
      minMatchCharLength: 2,
    });

    return scopedFuse.search(searchText).map((result) => result.item);
  }, [searchText, selectedCategory]);

  const visibleWojaks = useMemo(() => {
    const limit = searchText.trim() ? searchVisibleCount : defaultVisibleCount;
    return filteredWojaks.slice(0, limit);
  }, [filteredWojaks, searchText]);

  async function handleCopy(wojak: (typeof wojaks)[number]) {
    if (!existsSync(wojak.assetPath)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Image file is missing",
        message: wojak.filename,
      });
      return;
    }

    setIsLoading(true);

    try {
      await Clipboard.copy({ file: wojak.assetPath });
      await closeMainWindow();
      await showHUD(`Copied ${wojak.name}`);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to copy image",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Grid
      columns={6}
      inset={Grid.Inset.Small}
      isLoading={isLoading}
      searchBarPlaceholder="Search wojaks by name or category"
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <Grid.Dropdown tooltip="Filter by category" storeValue onChange={setSelectedCategory} value={selectedCategory}>
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
            content={{ source: wojak.thumbUrl }}
            title={wojak.name}
            subtitle={
              filteredWojaks.length > visibleWojaks.length
                ? `${wojak.category} • showing ${visibleWojaks.length} of ${filteredWojaks.length}`
                : wojak.category
            }
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
