{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };
  outputs = {
    self,
    nixpkgs,
  }: let
    forAllSystems = nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed;
  in {
    devShells = forAllSystems (system: let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };
      # Define our env packages (including the above)
      packages = with pkgs; [
        # Dev packages
        mystmd
        minijinja
        nodejs_22
        pnpm
      ];
    in {
      default = pkgs.mkShell {
        inherit packages;
      };
    });
  };
}
