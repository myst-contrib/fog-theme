from aiohttp import web, ClientSession
from minijinja import Environment
from pathlib import Path

CDN_HOST = "http://localhost:3100"
THIS_PATH = Path(__file__)

routes = web.RouteTableDef()


async def fetch_config():
    async with ClientSession() as session:
        async with session.get(f"{CDN_HOST}/config.json") as response:
            return await response.json()


async def fetch_page_content(page: str):
    async with ClientSession() as session:
        async with session.get(f"{CDN_HOST}/content/{page}") as response:
            return await response.json()


async def fetch_project():
    config = await fetch_config()
    return config["projects"][0]


def render_page(content: dict) -> str:
    templates = {}
    for template_path in (THIS_PATH.parent / "templates").glob("*.j2.html"):
        with open(template_path) as f:
            templates[template_path.name] = f.read()

    # For now, only render node
    env = Environment(templates=templates)
    return env.render_template("entrypoint.j2.html", mdast=content["mdast"])


@routes.get("/")
async def hello(request):
    project = await fetch_project()

    index = project["index"]
    index_json = await fetch_page_content(f"{index}.json")
    html = render_page(index_json)

    return web.Response(text=html, content_type="text/html")


app = web.Application()
app.add_routes(routes)

if __name__ == "__main__":
    web.run_app(app)
