import {
	$,
	h,
	drawLine,
	drawPoint,
	getFaviconURL,
	removeDebugLines,
	isDebug,
} from "../utils.js";
import { Widget } from "./GenericWidget.js";

type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

async function getBookmarks() {
	return (await chrome.bookmarks.getTree())[0].children[0].children;
}

function expandBookmarks(bookmarks: BookmarkNode[]): BookmarkNode[] {
	const expandedBookmarks: BookmarkNode[] = [];

	for (const bookmark of bookmarks) {
		expandedBookmarks.push(bookmark);
		if (bookmark.children?.length > 0) {
			expandedBookmarks.push(...expandBookmarks(bookmark.children));
		}
	}

	return expandedBookmarks;
}

export default new Widget(
	document.body,
	h("div", { id: "bookmark-container", className: "bookmark-container" }),
	renderBookmarks
);

async function renderBookmarks() {
	const bookmarks = await getBookmarks();

	$("#bookmark-container")[0].append(...bookmarks.map(Bookmark));

	snapBookmarkWidth();
	window.addEventListener("resize", snapBookmarkWidth);

	enableBookmarkDragging();

	document.addEventListener("click", closeMostNestedPopup);
}

function BookmarkElement(bookmark: BookmarkNode): HTMLElement {
	const imageUrl = getFaviconURL(bookmark.url);
	const bookmarkElement = h(
		"a",
		{
			className: "bookmark",
			id: bookmark.id,
			href: bookmark.url,
			draggable: true,
		},
		h("img", { src: imageUrl }),
		h("p", {}, bookmark.title)
	);

	return bookmarkElement;
}

function BookmarkFolder(bookmark: BookmarkNode): HTMLElement {
	const folderPopup = h(
		"div",
		{ className: "bookmark-popup", id: "popup-" + bookmark.id },
		...bookmark.children.map(Bookmark)
	);

	function openFolder(event: MouseEvent) {
		if (
			event.target !== folderElement ||
			folderElement.classList.contains("dragging")
		) {
			return;
		}

		Array.from(
			$(`#${folderElement.parentElement.id} > .folder.expanded`)
		).forEach(folder => {
			if (folder === folderElement) {
				return;
			}

			folder.classList.remove("expanded");
		});

		$(`#popup-${bookmark.id} .bookmark.folder`).forEach(folder => {
			folder.classList.remove("expanded");
		});

		folderElement.classList.toggle("expanded");
	}

	function openHoveredFolder(event: MouseEvent) {
		const otherOpenFolders = Array.from(
			$(`#${folderElement.parentElement.id} > .folder.expanded`)
		);

		if (folderElement.classList.contains("expanded")) {
			return;
		}

		if (otherOpenFolders.length > 0) {
			openFolder(event);
		}
	}

	const folderElement = h(
		"div",
		{
			className: "bookmark folder",
			id: bookmark.id,
			onclick: openFolder,
			onmouseover: openHoveredFolder,
			ondragenter: openFolder,
			draggable: true,
		},
		h(
			"div",
			{ className: "main" },
			h("img", { src: "./assets/folder.png" }),
			h("p", {}, bookmark.title)
		),
		folderPopup
	);

	return folderElement;
}

function Bookmark(bookmark: BookmarkNode): HTMLElement {
	const bookmarkElement =
		bookmark.children?.length > 0
			? BookmarkFolder(bookmark)
			: BookmarkElement(bookmark);

	return bookmarkElement;
}

function snapBookmarkWidth() {
	const bookmarkContainer = $("#bookmark-container")[0];
	bookmarkContainer.style.width = "fit-content";

	const padding = 10;
	const gap = 2;

	const bookmarkWidth = Math.ceil(
		bookmarkContainer.getClientRects()[0].width
	);

	let width = -gap + padding;

	for (const element of Array.from(bookmarkContainer.children)) {
		const widthWithGap = element.clientWidth + gap;

		if (width + widthWithGap > bookmarkWidth) {
			break;
		}

		width += widthWithGap;
	}

	bookmarkContainer.style.width = width + "px";
}

function enableBookmarkDragging() {
	$("#bookmark-container")[0].addEventListener("dragstart", event => {
		const draggedBookmark = event.target as HTMLElement;

		draggedBookmark.classList.add("no-full-width", "dragging");
		draggedBookmark.classList.remove("expanded");

		draggedBookmark.style.width =
			draggedBookmark.getClientRects()[0].width + "px";

		draggedBookmark.addEventListener(
			"dragend",
			async event => {
				event.preventDefault();

				const targetGap = getClosestGap(event.clientY, event.clientX);

				removeDebugLines();
				removeGiveRoom();

				draggedBookmark.classList.remove("dragging", "no-full-width");

				if (
					draggedBookmark.previousElementSibling ===
					targetGap.bookmark
				) {
					draggedBookmark.style.width = "";
					return;
				}

				const newParent = targetGap.parent;
				const newNextSibling = targetGap.bookmark.nextElementSibling;

				chrome.bookmarks.move(
					draggedBookmark.id,
					{
						parentId: newParent.id
							.replace("popup-", "")
							.replace("bookmark-container", "1"),
						index: newNextSibling
							? Array.from(newParent.children).indexOf(
									newNextSibling
							  )
							: newParent.children.length,
					},
					() => {
						if (chrome.runtime.lastError) {
							console.error(chrome.runtime.lastError);
						}
					}
				);

				const isVertical =
					newParent.classList.contains("bookmark-popup");

				const newBookmark = Bookmark(
					expandBookmarks(await getBookmarks()).find(
						b => b.id == draggedBookmark.id
					)
				);

				newBookmark.classList.add("tp");
				draggedBookmark.classList.add("tp");

				if (isVertical) {
					newBookmark.style.height =
						draggedBookmark.getClientRects()[0].height + "px";
				} else {
					newBookmark.style.width =
						draggedBookmark.getClientRects()[0].width + "px";
				}

				draggedBookmark.ontransitionend = () => {
					draggedBookmark.remove();
				};

				if (newNextSibling) {
					newParent.insertBefore(newBookmark, newNextSibling);
				} else {
					newParent.appendChild(newBookmark);
				}

				requestAnimationFrame(() => {
					newBookmark.classList.remove("tp");
				});
			},
			{ once: true }
		);
	});

	document.addEventListener("dragover", event => {
		event.preventDefault();

		const gap = getClosestGap(event.clientY, event.clientX);

		removeGiveRoom();

		gap.bookmark.classList.add("give-room");
	});

	function removeGiveRoom() {
		$(".give-room").map(e => e.classList.remove("give-room"));
	}
}

function getClosestGap(
	y: number,
	x: number
): {
	distance: number;
	gapCoords: number[];
	bookmark: HTMLElement;
	parent: HTMLElement;
} {
	const gaps = getGaps();
	const yMultiplier = 2;

	const closestGap = gaps.reduce(
		(min, gap) => {
			const distance =
				Math.abs(gap.y - y) * yMultiplier + Math.abs(gap.x - x);

			if (distance < min.distance) {
				return {
					distance,
					gapCoords: [gap.x, gap.y],
					bookmark: gap.bookmark,
					parent: gap.parent,
				};
			}

			return min;
		},
		{ distance: Infinity, gapCoords: [0, 0], bookmark: null, parent: null }
	);

	if (isDebug()) {
		$(".point").forEach(e => {
			e.style.backgroundColor =
				e.id == "point-" + closestGap.bookmark.id ? "green" : "red";
		});
		drawLine([x, y], closestGap.gapCoords);
	}

	return closestGap;
}

function getGaps(): {
	x: number;
	y: number;
	bookmark: HTMLElement;
	parent: HTMLElement;
}[] {
	const gaps = [];

	const bookmarks = [
		...$("#bookmark-container > .bookmark:not(.dragging)"),
		...$(".bookmark.folder.expanded > * > .bookmark:not(.dragging)"),
	];

	for (const bookmark of bookmarks) {
		if (bookmark.closest(".dragging")) {
			continue;
		}

		const container = bookmark.parentElement;

		const isVertical = container.classList.contains("bookmark-popup");

		const gapWidth = parseInt(
			getComputedStyle(container).gap.replace("px", "")
		);

		const elementRect = bookmark.getBoundingClientRect();

		const gapCoords = isVertical
			? [
					elementRect.x + elementRect.width / 2,
					elementRect.y + elementRect.height + gapWidth / 2,
			  ]
			: [
					elementRect.x + elementRect.width + gapWidth / 2,
					elementRect.y + elementRect.height / 2,
			  ];

		gaps.push({
			x: gapCoords[0],
			y: gapCoords[1],
			bookmark: bookmark,
			parent: container,
		});

		if (isDebug()) {
			drawPoint("point-" + bookmark.id, gapCoords);
		}
	}

	return gaps;
}

function closeMostNestedPopup(event: MouseEvent) {
	if ((event.target as HTMLElement).tagName !== "HTML") return;

	const openPopups = $(".bookmark.expanded") as HTMLElement[];

	if (openPopups.length == 0) return;

	const mostNestedPopup = openPopups.reduce((a, b) =>
		a.parentElement === b.parentElement ? a : b
	);

	mostNestedPopup.classList.remove("expanded");
}
