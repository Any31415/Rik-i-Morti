{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.nodePackages.npm
    pkgs.wget
  ];

  shellHook = ''
    bash setup.sh
  '';
}
